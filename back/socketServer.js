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
                    winner : gameModelGlobal.winner
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
                        winner : gameBoardSaved.winner
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
                        winner : gameModelGlobal.winner

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

                console.log('Current turn', gameBoard.currentPlayer+ " "+ playerCharacter.name);
                console.log("current position", playerCharacter.position.row + " " + playerCharacter.position.col);
                //find square where is the player
                let squareGameModel = gameModelGlobal.playable_squares.getAllPlayableSquares();

                for (let square of squareGameModel) {
                    console.log("square position", square.position.row + " " + square.position.col);
                    console.log("player position", playerCharacter.position.row + " " + playerCharacter.position.col);
                    if(parseInt(square.position.row) === parseInt(playerCharacter.position.row) && parseInt(square.position.col) === parseInt(playerCharacter.position.col)){
                        console.log("user found");
                        //update db
                        await db.collection('character').updateOne({ _id: playerCharacter._id , gameBoardId: gameBoard._id}, { $set: { position: { row: dataParse.row, col: dataParse.col } } });
                        let playerCharacterUpdated = await db.collection('character').findOne({ _id: new ObjectId(playerCharacter._id)});
                        console.log('Player position updated', playerCharacterUpdated.position.row + " " + playerCharacterUpdated.position.col);
                    }
                }
                await db.collection('gameboards').updateOne({ _id: gameBoard._id }, { $set: { currentPlayer: gameModelGlobal.currentPlayer } });
                const gameBoardUpdated = await db.collection('gameboards').findOne({ _id: gameBoard._id });
                console.log('Current player db  updated', gameBoardUpdated.currentPlayer);




                socket.emit('movecharactereresponse',responseBoolean);

            }
            catch (error) {
                console.error('Error moving character', error);
                socket.emit('movecharactereresponse', false);
            }

        });

        socket.on('placewall', async (wallData) => {
            try {
                let wallDataDeserialized = JSON.parse(wallData);

                let actionController = new ActionController(gameModelGlobal);
                let responseBoolean = actionController.placeWall(wallDataDeserialized);

                await client.connect();
                const db = client.db();
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
                        // Met à jour le mur pour définir isPresent à true
                        await db.collection('walls').updateOne({_id: wall._id}, {$set: {isPresent: true}});
                        const wallUpdated = await db.collection('walls').findOne({_id: wall._id});
                    } else {
                        console.log("Wall not found or already present");
                    }
                }

              /*  console.log('show all walls from bd when placing walls :', await db.collection('walls').find({}).toArray( function(err, result) {
                    if (err) throw err;
                    else console.log(result);
                }));*/

                // Envoyer la réponse au client
                await db.collection('gameboards').updateOne({ _id: gameBoardIdDb._id }, { $set: { currentPlayer: gameModelGlobal.currentPlayer } });
                const gameBoardUpdated = await db.collection('gameboards').findOne({ _id: gameBoardIdDb._id });
                console.log('Current player db  updated', gameBoardUpdated.currentPlayer);
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
            let playerId = data.playerId;
            let gameId = data.gameId;
            try {
                await client.connect();
                const db = client.db();
                let game = await db.collection('games').findOne({ _id: gameId });

                if (game) {
                    const gameState = JSON.parse(savedGame.gameState); // Assurez-vous que l'état du jeu est enregistré sous forme de chaîne JSON
                    gameModelGlobal = new GameModel(gameState); // Assurez-vous que le constructeur de GameModel accepte un paramètre pour l'initialisation
                    actionController = new ActionController(gameModelGlobal); // Réinitialisez votre contrôleur avec le nouveau modèle
                    socket.emit('updateGameModelResponse', JSON.stringify(gameModelGlobal)); // Envoyez le modèle de jeu reconstruit au client
                } else {
                    console.log(' UPDATE GAME MODEL No saved game found for this user');
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
