// socketServer.js
const socketIo = require('socket.io');
const {GameModel} = require('./logic/Model/Game/GameModel.js');
const {ActionController} = require("./logic/Controller/actionController.js");
const { MongoClient,ObjectId } = require('mongodb');
const {MONGO_URL} = require("./logic/Utils/constants");
const client = new MongoClient(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

let gameModelGlobal = null;
let actionController = null;

module.exports = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: "http://localhost:63342",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected');

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });

        socket.on('get game model', async (userToken) => {
            try {
                // Créer une nouvelle partie dans la base de données
                await client.connect();
                const db = client.db();
                const user = await db.collection('users').findOne({ token: userToken });
                const newGame = await db.collection('games').insertOne({
                    fog_of_war_on_or_off: false, // ou true, selon la logique de votre jeu
                    creator_id: user.username , // ID de l'utilisateur qui a créé la partie
                    game_name: 'New Game' // Nom de la partie, peut-être fourni par l'utilisateur
                });
                const gameId = newGame.insertedId;
                console.log('New game created with ID:', gameId);

                // Créer un nouveau GameModel
                gameModelGlobal = new GameModel();
                actionController = new ActionController(gameModelGlobal);
                // Persister le plateau de jeu
                const gameBoard = await db.collection('gameboards').insertOne({
                    gameId: gameId, // Lier le plateau de jeu à la partie
                    nbJoueursMax: gameModelGlobal.nbPlayers, // Nombre maximum de joueurs
                    roundCounter: gameModelGlobal.roundCounter, // Compteur de tours
                    currentPlayer: gameModelGlobal.currentPlayer, // Joueur actuel
                    winner : gameModelGlobal.winner,
                    lastChance: gameModelGlobal.lastChance,
                    // autres données du plateau de jeu
                });
                const gameBoardId = gameBoard.insertedId;

                //persister la position des joueurs
                const players = gameModelGlobal.player_array.getAllPlayers();
                await db.collection('character').insertMany(players.map((player, index) => ({
                    ...player,
                    gameBoardId: gameBoardId,
                    currentPlayerIndex: index + 1 // Ajout de l'attribut currentPlayerIndex
                })));


                // Persister les murs et les cases en référençant l'ID du plateau de jeu

                const horizontalWalls = gameModelGlobal.horizontal_Walls.getAllWalls();
                await db.collection('walls').insertMany(horizontalWalls.map(wall => ({
                    ...wall,
                    gameBoardId: gameBoardId,
                    idPlayer: null,
                    type: 'H' // Ajout d'une propriété pour indiquer l'orientation du mur
                })));

                const verticalWalls = gameModelGlobal.vertical_Walls.getAllWalls();
                await db.collection('walls').insertMany(verticalWalls.map(wall => ({
                    ...wall,
                    gameBoardId: gameBoardId,
                    type: 'V' // Ajout d'une propriété pour indiquer l'orientation du mur
                })));

                const squares = gameModelGlobal.playable_squares;
                const squaresList = [...squares.getAllPlayableSquares()];
                await db.collection('squares').insertMany(squaresList.map(square => ({
                    ...square,
                    gameBoardId: gameBoardId
                })));

                console.log("GAME MODEL GLOBAL PLAYER ARRAY: ",gameModelGlobal.player_array);


                // Envoyer l'état initial du jeu au client
                socket.emit('game model', JSON.stringify({
                    gameId: gameId, // ID de la partie
                    gameBoardId: gameBoardId, // ID du plateau de jeu
                    nbLignes: gameModelGlobal.nbLignes, // Nombre de lignes
                    nbColonnes: gameModelGlobal.nbColonnes, // Nombre de colonnes
                    player_array: gameModelGlobal.player_array.getAllPlayers(),
                    horizontal_Walls: gameModelGlobal.horizontal_Walls.getAllWalls(),
                    vertical_Walls: gameModelGlobal.vertical_Walls.getAllWalls(),
                    playable_squares: gameModelGlobal.playable_squares.getAllPlayableSquares(),
                    currentPlayer: gameModelGlobal.currentPlayer,
                    roundCounter: gameModelGlobal.roundCounter,
                    winner : gameModelGlobal.winner
                }));
            } catch (error) {
                console.error('Error creating game model', error);
                // Gérer l'erreur, par exemple en envoyant un message d'erreur au client
            }
        });

        socket.on('save game', async (data) => {
            try {
                console.log('Received request to save game:');
                console.log('Received request to save game:', data);

                // Récupérer l'ID de l'utilisateur à partir du token
                await client.connect();
                const db = client.db();
                let userToken = data.userToken;
                console.log('User token:', userToken);
                const userId = await db.collection('users').findOne({ token: userToken});
                console.log('User to save game:', userId);
                const gameDb = await db.collection('games').findOne({ _id: new ObjectId(data.gameId), creator_id: userId.username});
                console.log('Game to save gameDB:', gameDb);
                const gameBoardId = await db.collection('gameboards').findOne({ gameId: gameDb._id });

                console.log('Game to save gameBoardId:', gameBoardId);

                //show walls from games retrieved
                /*console.log('show all walls from bd when saving game :', await db.collection('walls').find({gameBoardId: gameBoardId._id}).toArray( function(err, result) {
                    if (err) throw err;
                    else console.log(result);
                }));*/
                // Sauvegarder l'état du jeu avec l'ID de l'utilisateur
                await db.collection('savedGames').insertOne({
                    userId,
                    gameId:gameDb._id, // Assurez-vous que gameState est un objet sérialisable
                    gameBoardId: gameBoardId._id,
                    createdAt: new Date()
                });


                // Confirmer la sauvegarde au client
                socket.emit('game saved', { success: true });
            } catch (error) {
                console.error('Error saving game', error);
                socket.emit('game saved', { success: false });
            }
        });

        socket.on('load saved game', async ({ userId }) => {
            try {
                await client.connect();
                const db = client.db();
                console.log('Received request to load saved game:', userId);
                let user = await db.collection('users').findOne({ userId });
                const savedGame = await db.collection('savedGames').findOne({ user });

                if (savedGame) {
                    const gameBoardSaved = await db.collection('gameboards').findOne({ _id: savedGame.gameBoardId });
                    //get all walls from gameBoardSaved
                    const wallsHorizontal = await db.collection('walls').find({gameBoardId: gameBoardSaved._id, type: 'H'}).toArray();
                    const wallsVertical = await db.collection('walls').find({gameBoardId: gameBoardSaved._id, type: 'V'}).toArray();
                    const playableSquares = await db.collection('squares').find({gameBoardId: gameBoardSaved._id}).toArray();
                    const players_array = await db.collection('character').find({gameBoardId: gameBoardSaved._id}).toArray();
                    const config = {
                        horizontal_Walls: wallsHorizontal,
                        vertical_Walls: wallsVertical,
                        playable_squares: playableSquares,
                        player_array: players_array,
                        currentPlayer: gameBoardSaved.currentPlayer,
                        roundCounter: gameBoardSaved.roundCounter,
                        winner : gameBoardSaved.winner,
                        lastChance: gameBoardSaved.lastChance
                    };

                    gameModelGlobal = new GameModel(config);
                    actionController = new ActionController(gameModelGlobal);

                    //show walls from savedGame bd

                    //show horizontal walls from savedGame gameModel

                    socket.emit('loaded game', JSON.stringify({
                        gameId: savedGame.gameId, // ID de la partie
                        gameBoardId: savedGame.gameBoardId, // ID du plateau de jeu
                        nbLignes: gameModelGlobal.nbLignes, // Nombre de lignes
                        nbColonnes: gameModelGlobal.nbColonnes, // Nombre de colonnes
                        player_array: gameModelGlobal.player_array.getAllPlayers(),
                        horizontal_Walls: gameModelGlobal.horizontal_Walls.getAllWalls(),
                        vertical_Walls: gameModelGlobal.vertical_Walls.getAllWalls(),
                        playable_squares: gameModelGlobal.playable_squares.getAllPlayableSquares(),
                        currentPlayer: gameModelGlobal.currentPlayer,
                        roundCounter: gameModelGlobal.roundCounter,
                        winner : gameModelGlobal.winner,
                        lastChance: gameModelGlobal.lastChance
                    }));
                }
                else {
                    console.log('No saved game found for this user');
                    socket.emit('error', 'No saved game found for this user.');



            }
        } catch (error) {
            console.error('Error loading saved game', error);
            socket.emit('error', 'Error loading the game.');
        }
    });

        socket.on('movecharactere', async(data)=>{
            const dataParse = JSON.parse(data);
            console.log("movecharactere",dataParse);
            try {
                let responseBoolean = actionController.moveCharacter(dataParse.id,dataParse.row,dataParse.col);
                console.log("responseBoolean of moving",responseBoolean);
                await client.connect();
                const db = client.db();
                console.log('Game ID from data:', dataParse.gameId);
                const gameIdDb = await db.collection('games').findOne({ _id: new ObjectId(dataParse.gameId) });

                console.log('Game ID from DB:', gameIdDb);
                const gameBoard = await db.collection('gameboards').findOne({ gameId: gameIdDb._id });

                const currentPlayer = gameBoard.currentPlayer;
                let playerCharacter = await db.collection('character').findOne({ gameBoardId: gameBoard._id, currentPlayerIndex: currentPlayer });

                //console.log('Current turn', gameBoard.currentPlayer+ " "+ playerCharacter.name);
                //console.log("current position", playerCharacter.position.row + " " + playerCharacter.position.col);
                //find square where is the player
                let squareGameModel = gameModelGlobal.playable_squares.getAllPlayableSquares();

                for (let square of squareGameModel) {
                    //console.log("square position", square.position.row + " " + square.position.col);
                    //console.log("player position", playerCharacter.position.row + " " + playerCharacter.position.col);
                    if(parseInt(square.position.row) === parseInt(playerCharacter.position.row) && parseInt(square.position.col) === parseInt(playerCharacter.position.col)){
                        console.log("user found");
                        //update db
                        await db.collection('character').updateOne({ _id: playerCharacter._id , gameBoardId: gameBoard._id}, { $set: { position: { row: dataParse.row, col: dataParse.col } } });
                        let playerCharacterUpdated = await db.collection('character').findOne({ _id: new ObjectId(playerCharacter._id)});
                        console.log('Player position updated', playerCharacterUpdated.position.row + " " + playerCharacterUpdated.position.col);
                    }
                }
                await db.collection('gameboards').updateOne({ _id: gameBoard._id }, { $set: { currentPlayer: gameModelGlobal.currentPlayer, lastChance: gameModelGlobal.lastChance, winner: gameModelGlobal.winner } });
                const gameBoardUpdated = await db.collection('gameboards').findOne({ _id: gameBoard._id });
                console.log('Current player db  updated', gameBoardUpdated.currentPlayer);

                socket.emit('movecharactereresponse',responseBoolean);

            }
            catch (error) {
                console.error('Error moving character', error);
                socket.emit('movecharactereresponse', false);
            }

        });

        socket.on('placewall', async (datas) => {
            try {
                let wallDataDeserialized = JSON.parse(datas);
                let playerID = gameModelGlobal.currentPlayer;
                //get player from bd
                await client.connect();
                const db = client.db();
                const playerBd = await db.collection('character').findOne({ gameBoardId: new ObjectId(wallDataDeserialized.gameBoardId), currentPlayerIndex: playerID });
                let actionController = new ActionController(gameModelGlobal);
                console.log("player bddddddd : " + playerBd);
                //console.log("WALLLIST BEFORE PLACEWALL : ",gameModelGlobal.horizontal_Walls.wallList);
                console.log("-------------------");

                let responseBoolean = actionController.placeWall(wallDataDeserialized,playerID);
                if(responseBoolean){
                    let nbWalls = playerBd.nbWalls - 1;
                    console.log("NBWALLS BEFORE NEXT PLAYER : ",nbWalls);
                    db.collection('character').updateOne({ _id: new ObjectId(playerBd._id) }, { $set: { nbWalls : nbWalls } });

                    console.log("GAME MODEL GLOBAL PLAYER ARRAY: ",gameModelGlobal.player_array);

                    const gameIdDb = await db.collection('games').findOne({ _id: new ObjectId(wallDataDeserialized.gameId) });
                    console.log('Game ID from DB:', gameIdDb);
                    const gameBoardIdDb = await db.collection('gameboards').findOne({ gameId: gameIdDb._id });
                    // Boucle sur chaque élément de wallList pour traiter et mettre à jour les murs
                    for (let wallString of wallDataDeserialized.wallList) {
                        // Extrait la ligne, la colonne et le type à partir de la chaîne de caractères
                        let [row, col, type] = wallString.split('X');
                        // Convertit les valeurs de la ligne et de la colonne en nombres
                        row = parseInt(row, 10);
                        col = parseInt(col, 10);

                        // Recherche le mur correspondant dans la base de données
                        const wall = await db.collection('walls').findOne({
                            "position.row": row,
                            "position.col": col,
                            "gameBoardId": gameBoardIdDb._id,
                            type: type
                        });

                        if (wall) {
                            let wallToCopy = null;
                            //CHERCHER LES VALEURS A UPDATE
                            if(type === 'H'){
                                for(let j=0;j<gameModelGlobal.horizontal_Walls.wallList.length;j++){
                                    let wall = gameModelGlobal.horizontal_Walls.wallList[j];
                                    if(wall.position.row === row && wall.position.col === col){
                                        wallToCopy = wall;break;
                                    }
                                }
                            }
                            else if(type === 'V'){
                                for(let j=0;j<gameModelGlobal.vertical_Walls.wallList.length;j++){
                                    let wall = gameModelGlobal.vertical_Walls.wallList[j];
                                    if(wall.position.row === row && wall.position.col === col){
                                        wallToCopy = wall;break;
                                    }
                                }
                            }

                            // Met à jour le mur pour définir isPresent à true
                            await db.collection('walls').updateOne({_id: new ObjectId(wall._id)}, {$set: {isPresent: wallToCopy.isPresent, visibility: wallToCopy.visibility, idPlayer: wallToCopy.idPlayer, wallGroup: wallToCopy.wallGroup}});
                            const wallUpdated = await db.collection('walls').findOne({_id: new ObjectId(wall._id)});

                            let squareGameModel = gameModelGlobal.playable_squares.getAllPlayableSquares();
                            for (let square of squareGameModel) {
                                //update db
                                await db.collection('squares').updateOne({ gameBoardId: gameBoardIdDb._id, "position.row": square.position.row, "position.col": square.position.col }, { $set: { isVisible: false , visibility: wall.visibility} });
                            }
                        }
                        else {
                            console.log("Wall not found or already present");
                        }
                    }
                    await db.collection('gameboards').updateOne({ _id: new ObjectId(gameBoardIdDb._id) }, { $set: { currentPlayer: gameModelGlobal.currentPlayer } });

                    const gameBoardUpdated = await db.collection('gameboards').findOne({ _id: new ObjectId(gameBoardIdDb._id) });
                    console.log('Current player db updated', gameBoardUpdated.currentPlayer);
                }
                // Envoyer la réponse au client

                socket.emit('placewallResponse', responseBoolean);
            }
            catch (error) {
                console.error('Error placing wall', error);
                socket.emit('placewallResponse', false);
            }
        });




        socket.on('joinGame', () => {
            let responseBoolean = gameController.join()

            socket.emit('placewallResponse',responseBoolean);
        });





        socket.on('getplayerposition',(id)=>{
            let idplayer = JSON.parse(id);
            let response = actionController.getPlayerPosition(idplayer);
            socket.emit('getplayerpositionresponse',response);
        });

        socket.on('updateGameInformation',()=>{
            let gameInformation = actionController.updateGameInformation();
            socket.emit('updateGameInformationResponse',gameInformation);
        });
        socket.on('updateWalls',()=>{
            let wallsList = actionController.updateWalls();
            socket.emit('updateWallsResponse',wallsList);
        });
        socket.on('checkWinner',()=>{
            let response = actionController.checkWinner();
            socket.emit('checkWinnerResponse',response);
        });

        /*
        data:{
                userId,
                gameId
              }

         */

        socket.on('updateGameModel', async ( data ) => {
            let datas = JSON.parse(data);
            let gameId = datas[1];
            console.log("GAME ID FOR UPDATE GAME MODEL :",gameId);
            try {
                await client.connect();
                const db = client.db();
                let game = await db.collection('games').findOne({ _id: new ObjectId(gameId) });
                console.log("GAME FOUND ?: " + game._id);

                if (game) {
                    const gameBoardSaved = await db.collection('gameboards').findOne({ gameId: game._id });
                    //get all walls from gameBoardSaved
                    const wallsHorizontal = await db.collection('walls').find({gameBoardId: gameBoardSaved._id, type: 'H'}).toArray();
                    const wallsVertical = await db.collection('walls').find({gameBoardId: gameBoardSaved._id, type: 'V'}).toArray();
                    const playableSquares = await db.collection('squares').find({gameBoardId: gameBoardSaved._id}).toArray();
                    const players_array = await db.collection('character').find({gameBoardId: gameBoardSaved._id}).toArray();
                    console.log("PLAYER ARRAY ON UPDATE",players_array);
                    const config = {
                        horizontal_Walls: wallsHorizontal,
                        vertical_Walls: wallsVertical,
                        playable_squares: playableSquares,
                        player_array: players_array,
                        currentPlayer: gameBoardSaved.currentPlayer,
                        roundCounter: gameBoardSaved.roundCounter,
                        winner : gameBoardSaved.winner,
                        lastChance: gameBoardSaved.lastChance
                    };

                    gameModelGlobal = new GameModel(config);
                    actionController = new ActionController(gameModelGlobal);

                    //show walls from savedGame bd

                    //show horizontal walls from savedGame gameModel

                    socket.emit('updateGameModelResponse', JSON.stringify({
                        gameId: gameBoardSaved.gameId, // ID de la partie
                        gameBoardId: gameBoardSaved._id, // ID du plateau de jeu
                        nbLignes: gameModelGlobal.nbLignes, // Nombre de lignes
                        nbColonnes: gameModelGlobal.nbColonnes, // Nombre de colonnes
                        player_array: gameModelGlobal.player_array.getAllPlayers(),
                        horizontal_Walls: gameModelGlobal.horizontal_Walls.getAllWalls(),
                        vertical_Walls: gameModelGlobal.vertical_Walls.getAllWalls(),
                        playable_squares: gameModelGlobal.playable_squares.getAllPlayableSquares(),
                        currentPlayer: gameModelGlobal.currentPlayer,
                        roundCounter: gameModelGlobal.roundCounter,
                        winner : gameModelGlobal.winner
                    }));
                } else {
                    console.log(' UPDATE GAME MODEL ERROR');
                    socket.emit('error', 'No saved game found for this user.');
                }
            } catch (error) {
                console.error('Error loading saved game', error);
                socket.emit('error', 'Error loading the game.');
            }
        });
    });

    return io;
};
