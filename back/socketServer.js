// socketServer.js
const socketIo = require('socket.io');
const {GameModel} = require('./logic/Model/Game/GameModel.js');
const {ActionController} = require("./logic/Controller/actionController.js");
const { MongoClient,ObjectId } = require('mongodb');
const {MONGO_URL} = require("./logic/Utils/constants");
const client = new MongoClient(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const {playBot} = require('./logic/Controller/botController.js');
const {createGameDb, saveGame, loadGameFromDb,updatePositionCharacter,manageBotMove,updateCurrentPlayerFromDb,updateWallsAndVisibilityFromBd} = require('./logic/Controller/gameController.js');

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

                // Créer un nouveau GameModel
                gameModelGlobal = new GameModel();
                actionController = new ActionController(gameModelGlobal);
                // Persister le plateau de jeu

                let gameBoardId = await createGameDb(gameId,gameModelGlobal,db);

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

                // Récupérer l'ID de l'utilisateur à partir du token
                await client.connect();
                const db = client.db();
                let userToken = data.userToken;

                //Sauvegarder l'état du jeu dans la base de données
                gameBoardId = await saveGame(userToken, db,data);

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
                    const config = await loadGameFromDb(savedGame);

                    gameModelGlobal = new GameModel(config);
                    actionController = new ActionController(gameModelGlobal);


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
            try {
                let responseBoolean = actionController.moveCharacter(dataParse.id,dataParse.row,dataParse.col);
                await client.connect();
                const db = client.db();
                let squareGameModel = gameModelGlobal.playable_squares.getAllPlayableSquares();

                let gameBoard = await updatePositionCharacter(dataParse,db,gameModelGlobal,squareGameModel);

                ///GESTION BOT
                await manageBotMove(squareGameModel,gameBoard,gameModelGlobal,actionController,db);

                await updateCurrentPlayerFromDb(gameBoard,db,gameModelGlobal);

                //on emit la réponse
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
                await client.connect();
                const db = client.db();

                // Récupérer le joueur actuel à partir de la base de données
                const playerBd = await db.collection('character').findOne({ gameBoardId: new ObjectId(wallDataDeserialized.gameBoardId), currentPlayerIndex: playerID });
                const gameIdDb = await db.collection('games').findOne({ _id: new ObjectId(wallDataDeserialized.gameId) });
                const gameBoardIdDb = await db.collection('gameboards').findOne({ gameId: gameIdDb._id });
                let squareGameModel = gameModelGlobal.playable_squares.getAllPlayableSquares();
                let actionController = new ActionController(gameModelGlobal);

                //on essaye de placer le mur
                let responseBoolean = actionController.placeWall(wallDataDeserialized,playerID);

                //si les murs sont placés
                if(responseBoolean){
                    //on met à jour le nombre de murs restants dans la bd pour le joueur
                    await updateWallsAndVisibilityFromBd(wallDataDeserialized,playerBd,gameBoardIdDb,gameModelGlobal,db,squareGameModel);


                    //Gestion Bot --action de bouger
                    await manageBotMove(squareGameModel,gameBoardIdDb,gameModelGlobal,actionController,db);

                    console.log("--MOVING--BOT-- NEXT PLAYER : ", gameModelGlobal.currentPlayer);

                    //on met à jour le joueur actuel dans la bd
                    await updateCurrentPlayerFromDb(gameBoardIdDb,db,gameModelGlobal);
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
            try {
                await client.connect();
                const db = client.db();
                let game = await db.collection('games').findOne({ _id: new ObjectId(gameId) });

                if (game) {
                    const gameBoardSaved = await db.collection('gameboards').findOne({ gameId: game._id });
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

                    console.log('--UPDATE-- CURRENT PLAYER :', gameModelGlobal.currentPlayer);

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
