// socketServer.js
const socketIo = require('socket.io');
const {GameModel} = require('../Model/Game/GameModel.js');
const {ActionController} = require("../Controller/actionController.js");
const { MongoClient,ObjectId } = require('mongodb');
const {MONGO_URL} = require("../Utils/constants");
const client = new MongoClient(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const {playBot, setupBotController, nextMoveBotController} = require('../Controller/botController.js');
const {updatePlayerPositionFromDb,createGameDb,setUpPositionRealBot, saveGame, loadGameFromDb,updatePositionCharacter,manageBotMove,updateCurrentPlayerFromDb,updateWallsAndVisibilityFromBd} = require('../Controller/gameUserController.js');

const handleWithFriendsMode = require('./GameModes/withFriends.js');
const handleWithBotsMode = require('./GameModes/withBots');
const handleOfflineMode = require('./GameModes/offline');
const handleChat = require('./Chat.js');
const sendNotification  = require('./onSignal.js');



const connectedUsers = {};
let eventGiven = false;

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
        handleChat(io, socket);
        manageEvents(io, socket);

        function manageEvents(io, socket){
            if(!eventGiven){

                sendNotification("Event halloween soon !")
                    .then(() => console.log('Notification sent on server start'))
                    .catch((error) => console.error('Error sending server-start notification:', error));


                setTimeout(async () => {
                        console.log("EVENT DANCEEER !");
                        for(let socketId in connectedUsers){
                            io.to(socketId).emit('event alert', { message: 'tu fais le fou toi ?', type: "dancer" });
                            eventGiven = true;
                            for(let socketId in connectedUsers){
                                let userId = connectedUsers[socketId].userId;

                                await client.connect();
                                const db = client.db();

                                const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;

                                await db.collection('users').updateOne(
                                    { _id: userObjectId }, // Critère de recherche
                                    { $push: { achievements: 'tu_fais_le_fou.jpg' } } // Modification à appliquer
                                );

                            }
                    }
                }, 10000);

                // setTimeout(async () => {
                //     console.log("EVENT HALLOWWEEEENN!");
                //     for(let socketId in connectedUsers){
                //         io.to(socketId).emit('event alert', { message: 'Halloweeeeen !', type: "halloween" });
                //     }
                // }, 10000);
                eventGiven = true;


            }

        }

        // Exemple de récupération de l'ID utilisateur lors de la connexion
        // Cela suppose que l'ID de l'utilisateur est envoyé juste après la connexion via un événement 'authenticate' ou similaire
        socket.on('authenticate', async(token) => {
            // Associer l'ID de l'utilisateur avec la socket
            await client.connect();
            const db = client.db();
            let user = await db.collection('users').findOne({ token: token});
            console.log("user", user);
            if(user){
                connectedUsers[socket.id] = { userId: user._id};
                console.log(`Client authenticated: ${user._id}`);
                console.log('Connected users:', connectedUsers);
            }

        });



        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${connectedUsers[socket.id]?.userId}`);
            // Suppression de l'utilisateur de l'objet connectedUsers
            delete connectedUsers[socket.id];
            console.log("user disconnected : ", socket.id);
            console.log('Connected users:', connectedUsers);
        });


        socket.on('send notification', async(data) => {
            console.log("send notification", data);
            let userWhoReceivedNotification = JSON.parse(data).invitedUserName;
            let userWhoSentNotification = JSON.parse(data).token;
            let typeNotification = JSON.parse(data).typeNotification;
            await client.connect();
            const db = client.db();
            let userReceivesDb = await db.collection('users').findOne({ username: userWhoReceivedNotification });

            const notification = {
                to: userReceivesDb._id, // ID de l'utilisateur qui reçoit la notification
                type: typeNotification, // Le type de notification
                date: new Date(), // Date de la notification
            };

            await db.collection('notifications').insertOne(notification);

            for (let socketId in connectedUsers) {
                console.log("socketId", socketId);
                console.log("connectedUsers[socketId].userId", connectedUsers[socketId].userId);
                console.log("userReceivesDb", userReceivesDb._id);
                // Comparez l'ID de l'utilisateur stocké dans connectedUsers avec l'ID de userReceivesDb
                if(connectedUsers[socketId].userId.toString() === userReceivesDb._id.toString()){
                    console.log("SEND NOTIFICATION TO USER");
                    // Utilisez socketId pour envoyer la notification via io.to()
                    io.to(socketId).emit("receive notification", { typeNotification });
                }
            }
            //socket.broadcast.emit("receive notification", data);
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

                    let characters =await retrieveCharacterFromDb(db,savedGame.gameBoardId);

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
                        gameMode: gameModelGlobal.typeGame,
                        typeGame: 'withBot',
                        ownIndexPlayer: characters[0].currentPlayerIndex
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
                let userToken = JSON.parse(data);
                //Sauvegarder l'état du jeu dans la base de données
                let user = await db.collection('users').findOne( {token: userToken} );
                // Confirmer la sauvegarde au client
                socket.emit('get info user response', JSON.stringify(user));
            } catch (error) {
                console.error('Error getting info user', error);
                socket.emit('get info user response', { success: false });
            }
        });

        // Récupérer les succès de l'utilisateur
        socket.on('get all achievements', async (data) => {
            try {
                await client.connect();
                const db = client.db();
                console.log('Received request to get all achievements:', data);

                // Récupération de l'utilisateur basé sur le token fourni
                let userToken = JSON.parse(data);
                let user = await db.collection('users').findOne({ token: userToken });

                // Récupération de tous les achievements de la base de données
                let allAchievements = await db.collection('achievements').find({}).toArray();

                // Marquage des achievements comme visibles ou non pour l'utilisateur
                let achievementsWithVisibility = allAchievements.map(achievement => {
                    return {
                        ...achievement,
                        isVisible: user.achievements.includes(achievement._id)
                    };
                });

                console.log('User achievements with visibility: ', achievementsWithVisibility);

                // Envoi des achievements avec l'indicateur isVisible au client
                socket.emit('get all achievements response', JSON.stringify(achievementsWithVisibility));
            } catch (error) {
                console.error('Error getting all achievements', error);
                socket.emit('get all achievements response', JSON.stringify({ success: false }));
            }
        });


    });

    return io;
};
