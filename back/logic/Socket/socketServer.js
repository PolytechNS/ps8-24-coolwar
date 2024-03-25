// socketServer.js
const socketIo = require('socket.io');
const {GameModel} = require('../Model/Game/GameModel.js');
const {ActionController} = require("../Controller/actionController.js");
const { MongoClient,ObjectId } = require('mongodb');
const {MONGO_URL} = require("../Utils/constants");
const client = new MongoClient(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const {playBot, setupBotController, nextMoveBotController} = require('../Controller/botController.js');
const {updatePlayerPositionFromDb,createGameDb,setUpPositionRealBot, saveGame, loadGameFromDb,updatePositionCharacter,manageBotMove,updateCurrentPlayerFromDb,updateWallsAndVisibilityFromBd} = require('../Controller/gameController.js');

const handleWithFriendsMode = require('./GameModes/withFriends.js');
const handleWithBotsMode = require('./GameModes/withBots');
const handleOfflineMode = require('./GameModes/offline');




module.exports = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: "http://localhost:63342",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected');
        handleWithFriendsMode(io, socket);
        handleWithBotsMode(io, socket);
        handleOfflineMode(io, socket);

        socket.on('disconnect', () => {
            console.log('Client disconnected');
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
                        lastChance: gameModelGlobal.lastChance,
                        gameMode: gameModelGlobal.typeGame
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

        socket.on('get info user', async (data) => {
            try {

                // Récupérer l'ID de l'utilisateur à partir du token
                await client.connect();
                const db = client.db();
                dataParsed = JSON.parse(data);
                let userToken = dataParsed.userToken;

                //Sauvegarder l'état du jeu dans la base de données
                let user = await db.collection('users').findOne({ token: userToken });

                // Confirmer la sauvegarde au client
                socket.emit('get info user response', JSON.stringify(user));
            } catch (error) {
                console.error('Error getting info user', error);
                socket.emit('get info user response', { success: false });
            }
        });

        // socket.on('joinGame', () => {
        //     let responseBoolean = gameController.join()
        //
        //     socket.emit('placewallResponse',responseBoolean);
        // });

    });

    return io;
};
