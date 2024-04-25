const {MongoClient, ObjectId} = require("mongodb");
const {MONGO_URL, withBot} = require("../../Utils/constants.js");
const {GameModel} = require("../../Model/Game/GameModel.js");
const {ActionController} = require("../../Controller/actionController.js");
const client = new MongoClient(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const {setUpPositionRealBot, createGameDb,
    updatePositionCharacter,
    manageBotMove,
    updateWinnerAndLooser,
    updateWinnerAndLooserBot,
    retrieveCharacterFromDb,
    updateCurrentPlayerFromDb,
    updateWallsAndVisibilityFromDBForExplode,
    updateWallsAndVisibilityFromBd
} = require("../../Controller/gameUserController.js");
const {verifyMessage} = require("../../Controller/Chat/chatController.js");
const {addExpToPlayerWithBot,manageEndGameUser,checkAchievements} = require("../../Controller/userController.js");
const {PlayerManager} = require("../../Model/Objects/PlayerManager");
const {GamePlayer} = require("../../Model/Objects/GamePlayer");


// Variables globales pour la gestion des rooms et des joueurs
const games = new Map();
const waitingPlayersForInstantGame = new Map();
const waitingRoomsForFriends = new Map();
const socketIds = new Map();
let countdownTimers = new Map(); // Pour stocker les timers par gameId

module.exports = (io, socket) => {
    socket.on('joinGameWithFriends', async (data) => {
        let dataParse = JSON.parse(data);
        let token = dataParse.token;
        let gameMode = dataParse.gameMode;
        if (gameMode === 'playNow') {
            joinInstantGame(io, socket, token);
        }
        // Jouer avec un ami
        else if (gameMode === 'waitingForFriends') {
            joinGameWithFriend(io, socket, dataParse);
        }
        else if (gameMode === 'launchGameWithFriends') {
            launchGameWithFriends(io, socket, dataParse);
        }

    });

    socket.on("ready", async (data) => {
      const tokenParsed = JSON.parse(data).token;
      io.to(socket.id).emit("player ready response", JSON.stringify({}));
    },

    socket.on('disconnect', async () => {
        console.log("DISCONNECT FROM WITH FRIENDS");
        // Identifier le joueur par son socket.id et le supprimer des listes d'attente
        let foundToken;
        for (let [token, sid] of waitingPlayersForInstantGame.entries()) {
            if (sid === socket.id) {
                foundToken = token;
                break;
            }
        }

        if (foundToken) {
            waitingPlayersForInstantGame.delete(foundToken);
            console.log(`Player with token ${foundToken} removed from instant game waiting list.`);
        }

        // Suppression pour les joueurs en attente de jouer avec des amis
        foundToken = undefined; // Réinitialisation de foundToken
        for (let [token, roomId] of waitingRoomsForFriends.entries()) {
            const room = io.sockets.adapter.rooms.get(roomId);
            if (room && room.sockets[socket.id]) {
                foundToken = token;
                break;
            }
        }

        if (foundToken) {
            waitingRoomsForFriends.delete(foundToken);
            console.log(`Room for playing with friends removed due to disconnect of player with token ${foundToken}.`);
        }

        // Suppression des références socketIds
        foundToken = undefined; // Réinitialisation de foundToken
        for (let [token, sid] of socketIds.entries()) {
            if (sid === socket.id) {
                foundToken = token;
                break;
            }
        }

        if (foundToken) {
            socketIds.delete(foundToken);
            console.log(`Socket ID reference removed for player with token ${foundToken}.`);
        }


    }));

    socket.on('joinWaitingRoom', async (data) => {
        const { token, gameId } = JSON.parse(data);

        // Création de la room s'il s'agit du premier joueur ou récupération de la room existante
        let room = waitingRoomsForFriends.get(gameId) || { players: {} };

        // Ajout ou mise à jour du joueur avec son état 'ready' à false
        room.players[token] = { ready: false };

        // Faire rejoindre le socket à la room spécifique et enregistrer le socket ID
        socket.join(`game_${gameId}`);
        socketIds.set(token, socket.id);

        // Mise à jour de la room dans la map
        waitingRoomsForFriends.set(gameId, room);

        console.log(`Player with token ${token} joined waiting room for game ${gameId}`);

        // Vérifier si tous les joueurs nécessaires sont présents et prêts
        // Ceci est juste un exemple, vous devrez ajuster selon la logique de votre jeu
        if (Object.keys(room.players).length === 2) { // Supposons que 2 joueurs sont nécessaires pour démarrer
            // Vérifier si tous les joueurs sont prêts
            const allPlayersReady = Object.values(room.players).every(player => player.ready);
            if (allPlayersReady) {
                // Tous les joueurs sont prêts
                io.to(`game_${gameId}`).emit('startGameWithFriend', { gameId });
                console.log(`Game ${gameId} is starting...`);
            }
        }
    });

    socket.on('ready', async (data) => {
        const { token } = JSON.parse(data);
        let userId;

        try {
            await client.connect();
            const user = await client.db().collection('users').findOne({ token: token });
            if (!user) {
                console.error('User not found');
                return;
            }
            userId = user._id.toString();

            for (let [gameId, room] of waitingRoomsForFriends.entries()) {
                if (room.players.hasOwnProperty(userId)) { // Assurez-vous que le joueur est dans la salle
                    // Met à jour l'état 'ready' du joueur
                    room.players[userId].ready = !room.players[userId].ready;

                    const playerCount = Object.keys(room.players).length;
                    const allReady = playerCount === 2 && Object.values(room.players).every(player => player.ready);

                    if (allReady) {
                        // Si tous les deux joueurs sont prêts
                        startCountdown(io, room, gameId);
                    } else {
                        // Si un des joueurs n'est plus prêt ou s'il n'y a pas deux joueurs prêts
                        const countdownTimerExists = countdownTimers.has(gameId);
                        if (countdownTimerExists) {
                            clearInterval(countdownTimers.get(gameId));
                            countdownTimers.delete(gameId);
                            io.to(room.roomId).emit('launch clock cancelled', "Countdown stopped. Waiting for all players to be ready.");
                        }
                    }

                    io.to(room.roomId).emit('join waiting room response', room); // Mettre à jour tous les joueurs avec l'état actuel
                    console.log(`Player ${userId}'s ready state updated in game ${gameId}`);
                    break; // Sortir de la boucle une fois l'état mis à jour
                }
            }
        } catch (error) {
            console.error('Error setting player to ready', error);
        } finally {
            await client.close();
        }
    });

    function startCountdown(io, room, gameId) {
        let countdown = 5;
        const intervalId = setInterval(() => {
            io.to(room.roomId).emit('launch clock', countdown);
            countdown--;
            if (countdown < 0) {
                clearInterval(intervalId);
                countdownTimers.delete(gameId); // Nettoyer la référence du timer
                io.to(room.roomId).emit('startGameWithFriend', { gameId });
                console.log(`Game ${gameId} is starting after countdown.`);
            }
        }, 1000);
        countdownTimers.set(gameId, intervalId); // Stocker la référence du timer
    }


    socket.on('moveCharacterWithFriends', async(data)=>{
        const dataParse = JSON.parse(data);
        try {
            //On récupère la partie dans la map
            let actionController = games.get(dataParse.gameId).actionController;
            let gameModel = games.get(dataParse.gameId).gameModel;
            console.log("move character with friends",dataParse);
            //move le personnage
            let responseBoolean = actionController.moveCharacter(dataParse.id,dataParse.row,dataParse.col);
            console.log("responseBoolean IL PEUT BOUGER ?",responseBoolean);
            await client.connect();
            const db = client.db();
            //on récupère les carrés jouables
            let squareGameModel = gameModel.playable_squares.getAllPlayableSquares();
            //afficher les carrés jouables

            //on met à jour la position du joueur dans la bd
            let gameBoard = await updatePositionCharacter(dataParse,db,gameModel);

            //on met à jour le joueur actuel dans la bd
            await updateCurrentPlayerFromDb(gameBoard,db,gameModel);

            //on emit la réponse
            socket.emit('moveCharacterWithFriendsResponse',responseBoolean);

        }
        catch (error) {
            console.error('Error moving character', error);
            socket.emit('moveCharacterWithBotResponse', false);
        }

    });

    socket.on('placeWallWithFriends', async (datas) => {
        try {
            let wallDataDeserialized = JSON.parse(datas);
            let actionController = games.get(wallDataDeserialized.gameId).actionController;
            let gameModel = games.get(wallDataDeserialized.gameId).gameModel;

            let playerID = wallDataDeserialized.ownIndexPlayer;
            await client.connect();
            const db = client.db();
            console.log("wallDataDeserialized : ", wallDataDeserialized);
            console.log("playerID : ", playerID);
            // Récupérer le joueur actuel à partir de la base de données
            const playerBd = await db.collection('character').findOne({ gameBoardId: new ObjectId(wallDataDeserialized.gameBoardId), currentPlayerIndex: playerID });
            const gameIdDb = await db.collection('games').findOne({ _id: new ObjectId(wallDataDeserialized.gameId) });
            const gameBoardIdDb = await db.collection('gameboards').findOne({ gameId: gameIdDb._id });
            let squareGameModel = gameModel.playable_squares.getAllPlayableSquares();
            //let actionController = new ActionController(gameModelGlobal);

            //on essaye de placer le mur
            let responseBoolean = actionController.placeWall(wallDataDeserialized,playerID);

            //si les murs sont placés
            if(responseBoolean){
                //on met à jour le nombre de murs restants dans la bd pour le joueur
                await updateWallsAndVisibilityFromBd(wallDataDeserialized,playerBd,gameBoardIdDb,gameModel,db);
                //on met à jour le joueur actuel dans la bd
                await updateCurrentPlayerFromDb(gameBoardIdDb,db,gameModel);
            }
            // Envoyer la réponse au client

            socket.emit('placeWallWithFriendsResponse', responseBoolean);
        }
        catch (error) {
            console.error('Error placing wall', error);
            socket.emit('placeWallWithFriendsResponse', false);
        }
    });

    socket.on('getplayerpositionWithFriends',(data)=>{
        let dataParse = JSON.parse(data);
        let actionController = games.get(dataParse.gameId).actionController;
        let response = actionController.getPlayerPosition(dataParse.idPlayer);
        socket.emit('getplayerpositionresponseWithFriends',response);
    });

    socket.on('checkWinnerWithFriends',async (data)=>{
        let dataParse = JSON.parse(data);
        console.log("CHECK WINNER WITH FRIENDS : ",dataParse);
        let actionController = games.get(dataParse.gameId).actionController;
        let response = actionController.checkWinner();
        if(response !==-1){
            console.log("GAME FINISHED");
            let winner = response;
            console.log("winner",winner);
            let looser = (winner === 1) ? 2 : 1;
            await manageEndGameUser(dataParse.gameId,winner,looser);
            await updateWinnerAndLooser(dataParse.gameId,winner);

            console.log("token Player 1 --> ",games.get(dataParse.gameId).player1Token);
            console.log("token Player 2 --> ",games.get(dataParse.gameId).player2Token);

            let achievementsUnlockedPl1 = await checkAchievements(games.get(dataParse.gameId).player1Token, winner, dataParse.gameId);
            //faudrait que ça retourne ls achievements du joueur 1
            let achievementsUnlockedPl2 = await checkAchievements(games.get(dataParse.gameId).player2Token, winner, dataParse.gameId);

            console.log("achievementsUnlockedPl1",achievementsUnlockedPl1);
            console.log("achievementsUnlockedPl2",achievementsUnlockedPl2);

            await sendNotifToUser(io,games.get(dataParse.gameId).player1Token,achievementsUnlockedPl1);
            await sendNotifToUser(io,games.get(dataParse.gameId).player2Token,achievementsUnlockedPl2);
            //ensuite on emit la réponse des achievements
            //Et cote front on a une méthode dans l'indexFriends qui va écouter cette réponse et afficher les achievements sur une pop up
        }
        socket.emit('checkWinnerWithFriendsResponse',response);
    });

    async function sendNotifToUser(ioServer,token, unlockedAchievementIds) {
        try {
            await client.connect();
            const db = client.db();
            console.log("sending notification ACHIEVEMENTS");
            console.log("achievemnts unlocked",unlockedAchievementIds);
            // Récupérer tous les achievements de la base de données
            let allAchievements = await db.collection('achievements').find({}).toArray();

            // Filtrer pour obtenir seulement les détails des achievements débloqués
            let unlockedAchievementsDetails = allAchievements.filter(achievement => unlockedAchievementIds.achievements.includes(achievement._id));

            let socketId = socketIds.get(token);
            console.log("socketId to send notif",socketId);
            // Envoyer les détails des achievements débloqués à l'utilisateur
            ioServer.to(socketIds.get(token)).emit('achievementsUnlocked', JSON.stringify(unlockedAchievementsDetails));
        } catch (error) {
            console.error('Error sending notifications to user', error);
        }
    }

    socket.on('updateGameModelWithFriends', async ( data ) => {
        let datas = JSON.parse(data);
        let gameId = datas[2];
        console.log("UPDATE GAME MODEL WITH FRIENDS",datas);
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
                    lastChance: gameBoardSaved.lastChance,
                    typeGame: game.typeGame
                };

                let gameModel = new GameModel(config);
                let actionController = new ActionController(gameModel);

                // Stocker l'instance de GameModel dans la map
                let gameBeforeUpdate = games.get(gameId.toString());

                gameBeforeUpdate.gameModel = gameModel;
                gameBeforeUpdate.actionController = actionController;
                games.set(gameId.toString(), gameBeforeUpdate);

                //récupérer les socket des 2 users dans socketIds
                let player1SocketId= socketIds.get(gameBeforeUpdate.player1Token);
                let player2SocketId = socketIds.get(gameBeforeUpdate.player2Token);

                let roomId = games.get(gameId.toString()).roomId;

                let characters =await retrieveCharacterFromDb(db,gameBoardSaved._id);

                let playerArrayToSend1 = new PlayerManager();
                let playerArrayToSend2 = new PlayerManager();
                playerArrayToSend1.addPlayer(new GamePlayer(gameModel.player_array.getPlayer(1).name, gameModel.player_array.getPlayer(1).position, gameModel.player_array.getPlayer(1).nbWalls));
                playerArrayToSend2.addPlayer(new GamePlayer(gameModel.player_array.getPlayer(2).name, gameModel.player_array.getPlayer(2).position, gameModel.player_array.getPlayer(2).nbWalls));
                let playableSquareWhereEnemyIsFor1 = gameModel.playable_squares.getPlayableSquare(gameModel.player_array.getPlayer(2).position.row, gameModel.player_array.getPlayer(2).position.col);
                let playableSquareWhereEnemyIsFor2 = gameModel.playable_squares.getPlayableSquare(gameModel.player_array.getPlayer(1).position.row, gameModel.player_array.getPlayer(1).position.col);
                if (playableSquareWhereEnemyIsFor1.visibility <= 0) {
                    playerArrayToSend1.addPlayer(new GamePlayer(gameModel.player_array.getPlayer(2).name, gameModel.player_array.getPlayer(2).position, gameModel.player_array.getPlayer(2).nbWalls));
                }
                if (playableSquareWhereEnemyIsFor2.visibility >= 0) {
                    playerArrayToSend2.addPlayer(new GamePlayer(gameModel.player_array.getPlayer(1).name, gameModel.player_array.getPlayer(1).position, gameModel.player_array.getPlayer(1).nbWalls));
                }

                let PlayableSquareObfuscedOne = gameModel.playable_squares.getAllPlayableSquares();
                PlayableSquareObfuscedOne.forEach((square) => {
                    if(square.visibility < 0){square.visibility = -1;}
                    if(square.visibility > 0){square.visibility = 1;}
                });
                let PlayableSquareObfuscedTwo = gameModel.playable_squares.getAllPlayableSquares();
                PlayableSquareObfuscedTwo.forEach((square) => {
                    if(square.visibility < 0){square.visibility = -1;}
                    if(square.visibility > 0){square.visibility = 1;}
                });

                io.to(player1SocketId).emit('updateGameModelWithFriendsResponse', JSON.stringify({
                    gameId: gameBoardSaved.gameId, // ID de la partie
                    gameBoardId: gameBoardSaved._id, // ID du plateau de jeu
                    nbLignes: gameModel.nbLignes, // Nombre de lignes
                    nbColonnes: gameModel.nbColonnes, // Nombre de colonnes
                    player_array: playerArrayToSend1.getAllPlayers(),
                    horizontal_Walls: gameModel.horizontal_Walls.getAllWalls(),
                    vertical_Walls: gameModel.vertical_Walls.getAllWalls(),
                    playable_squares: PlayableSquareObfuscedOne,
                    currentPlayer: gameModel.currentPlayer,
                    roundCounter: gameModel.roundCounter,
                    winner : gameModel.winner,
                    typeGame: gameModel.typeGame,
                    roomId: datas.roomId,
                    test:"pla1",
                    ownIndexPlayer: characters[0].currentPlayerIndex,
                    ennemyName: characters[1].name
                }));

                io.to(player2SocketId).emit('updateGameModelWithFriendsResponse', JSON.stringify({
                    gameId: gameBoardSaved.gameId, // ID de la partie
                    gameBoardId: gameBoardSaved._id, // ID du plateau de jeu
                    nbLignes: gameModel.nbLignes, // Nombre de lignes
                    nbColonnes: gameModel.nbColonnes, // Nombre de colonnes
                    player_array: playerArrayToSend2.getAllPlayers(),
                    horizontal_Walls: gameModel.horizontal_Walls.getAllWalls(),
                    vertical_Walls: gameModel.vertical_Walls.getAllWalls(),
                    playable_squares: PlayableSquareObfuscedTwo,
                    currentPlayer: gameModel.currentPlayer,
                    roundCounter: gameModel.roundCounter,
                    winner : gameModel.winner,
                    typeGame: gameModel.typeGame,
                    roomId: datas.roomId,
                    test:"pla2",
                    ownIndexPlayer: characters[1].currentPlayerIndex,
                    ennemyName: characters[0].name
                }));
                console.log("GAME MODEL SENDING !");
            } else {
                console.log(' UPDATE GAME MODEL ERROR');
                socket.emit('error', 'No saved game found for this user.');
            }
        } catch (error) {
            console.error('Error loading saved game', error);
            socket.emit('error', 'Error loading the game.');
        }
    });

    socket.on('explodeWallWithFriends', async (data) => {
        let actionDeserialized = JSON.parse(data);
        let actionController = games.get(actionDeserialized.gameId).actionController;
        let gameModel = games.get(actionDeserialized.gameId).gameModel;
        let playerID = actionDeserialized.ownIndexPlayer;
        await client.connect();
        const db = client.db();
        console.log("actionDeserialized : ", actionDeserialized);
        console.log("playerID : ", playerID);
        // Récupérer le joueur actuel à partir de la base de données
        const playerBd = await db.collection('character').findOne({ gameBoardId: new ObjectId(actionDeserialized.gameBoardId), currentPlayerIndex: playerID });
        console.log("playerBd : ", playerBd);
        const gameIdDb = await db.collection('games').findOne({ _id: new ObjectId(actionDeserialized.gameId) });
        const gameBoardIdDb = await db.collection('gameboards').findOne({ gameId: gameIdDb._id });

        //on essaye de placer le mur
        let wallsToUpdate = actionController.explodeWall(actionDeserialized,playerID);
        console.log("INSIDE WITH FRIEND");
        console.log("RESPONSE FROM EXPLODEWALL",wallsToUpdate!=null);

        //si les murs sont placés
        if(wallsToUpdate!=null){
            console.log("EXPLODE REPONSE IS POSITIVE !");
            //on met à jour le nombre de murs restants dans la bd pour le joueur
            await updateWallsAndVisibilityFromDBForExplode(wallsToUpdate,playerBd,gameBoardIdDb,gameModel,db);
            //await updateWallsAndVisibilityFromBd(actionDeserialized,playerBd,gameBoardIdDb,gameModel,db);
            //on met à jour le joueur actuel dans la bd
            await updateCurrentPlayerFromDb(gameBoardIdDb,db,gameModel);
        }
        // Envoyer la réponse au client

        socket.emit('explodeWallWithFriendsResponse', (wallsToUpdate!=null));
    });

    socket.on('sendChatMessage', async (data) => {
        const { roomId, message, token} = JSON.parse(data);
        console.log("message received",message);

        if (roomId && message.trim().length > 0) {
            let result = verifyMessage(message);

            await client.connect();
            const db = client.db();
            const user = await db.collection('users').findOne({ token});
            console.log("sending message from : ",user);
            if(!result){
                io.to(roomId).emit('receiveChatMessage', JSON.stringify({
                    sender: false,  // Vous pouvez utiliser autre chose pour identifier l'expéditeur
                    message: "Message non autorisé, veuillez respecter les règles de la communauté."
                }));
            }else{
                io.to(roomId).emit('receiveChatMessage', JSON.stringify({
                    sender: user.username,  // Vous pouvez utiliser autre chose pour identifier l'expéditeur
                    message: message.trim()
                }));
            }

        }
    });

};

const waitingPlayersForLaunchingGame = new Map();

async function launchGameWithFriends(io, socket, data) {
    console.log("LAUNCHING GAME WITH FRIENDS");
    const token = data.token;
    let userId, userRoomId, gameId;

    try {
        await client.connect();
        // Trouver l'utilisateur par token pour obtenir son ID et des informations supplémentaires
        const user = await client.db().collection('users').findOne({token});
        if (!user) {
            console.error('User not found');
            return;
        }
        userId = user._id.toString();
        // Identifier la salle d'attente où les deux joueurs sont prêts
        let roomForGame;
        for (let [gameIdRoom, room] of waitingRoomsForFriends.entries()) {
            if (room.players[userId] && Object.values(room.players).every(player => player.ready)) {
                roomForGame = room;
                gameId = room.gameId;
                break;
            }
        }
        if(roomForGame){
            const playerIds = Object.keys(roomForGame.players);
            const opponentId = playerIds.find(id => id !== userId); // Trouver l'ID de l'opposant

            // Récupérer les informations de l'opposant, y compris son token
            const opponent = await client.db().collection('users').findOne({ _id: new ObjectId(opponentId) });
            if (!opponent) {
                console.error('Opponent not found');
                return;
            }
            let opponentToken = opponent.token;


            if (waitingPlayersForLaunchingGame.has(opponentToken)) {
                // Un adversaire est trouvé, préparation de la partie
                const opponentSocketId = waitingPlayersForLaunchingGame.get(opponentToken);
                const roomId = `instant_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

                // Faire rejoindre le socket actuel à la room
                socket.join(roomId);
                socketIds.set(token, socket.id);
                // Trouver le socket de l'adversaire et le faire rejoindre la room
                const opponentSocket = io.sockets.sockets.get(opponentSocketId);
                opponentSocket.join(roomId);

                // Continuer avec la logique de mise en place de la partie...
                const playerTokens = [token, opponentToken];
                console.log("*************playerTokens*****************",playerTokens);
                const playersSocketIds = [socket.id, opponentSocketId];

                let gamesToSend = await createGame(roomId, playerTokens, playersSocketIds, gameId);
                if (!gamesToSend) {
                    console.log("error creating game");
                    return;
                }

                io.to(socket.id).emit('joinGameWithFriendsResponse', JSON.stringify(gamesToSend.gamePlayerOne));
                io.to(opponentSocketId).emit('joinGameWithFriendsResponse', JSON.stringify(gamesToSend.gamePlayerTwo));

                // Nettoyer
                waitingPlayersForLaunchingGame.delete(token);
                waitingPlayersForLaunchingGame.delete(opponentToken);



            } else {
                //si la room n'est pas trouvée dans la salle d'attente
                waitingPlayersForLaunchingGame.set(token, socket.id);
                socketIds.set(token, socket.id);

            }
        }else{
            console.log("Room not found");
        }
    } catch (error) {
        console.error('Error launching game with friends', error);
    }

}


async function joinInstantGame(io, socket, tokenParsed) {
    console.log("JOIN INSTANT GAME WITH TOKEN ->", tokenParsed);
    // Recherche d'un joueur en attente
    const opponentToken = [...waitingPlayersForInstantGame.keys()].find(t => t !== tokenParsed);

    if (opponentToken) {
        // Un adversaire est trouvé, préparation de la partie
        const opponentSocketId = waitingPlayersForInstantGame.get(opponentToken);
        const roomId = `instant_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        // Faire rejoindre le socket actuel à la room
        socket.join(roomId);
        socketIds.set(tokenParsed, socket.id);
        // Trouver le socket de l'adversaire et le faire rejoindre la room
        const opponentSocket = io.sockets.sockets.get(opponentSocketId);
        opponentSocket.join(roomId);

        // Continuer avec la logique de mise en place de la partie...
        const playerTokens = [tokenParsed, opponentToken];
        console.log("*************playerTokens*****************",playerTokens);
        const playersSocketIds = [socket.id, opponentSocketId];

        let gamesToSend = await createGame(roomId, playerTokens, playersSocketIds);
        if (!gamesToSend) {
            console.log("error creating game");
            return;
        }

        io.to(socket.id).emit('opponentFound', JSON.stringify(gamesToSend.gamePlayerOne));
        io.to(opponentSocketId).emit('opponentFound', JSON.stringify(gamesToSend.gamePlayerTwo));

        // Nettoyer
        waitingPlayersForInstantGame.delete(tokenParsed);
        waitingPlayersForInstantGame.delete(opponentToken);
    } else {
        // Aucun adversaire trouvé, mise en attente du joueur
        waitingPlayersForInstantGame.set(tokenParsed, socket.id);
        socketIds.set(tokenParsed, socket.id);
    }
}


async function joinGameWithFriend(io, socket, data) {
    await client.connect();
    const db = client.db();
    const {token, gameMode} = data;
    console.log("JOIN GAME WITH FRIENDS",data);

    let user = await db.collection('users').findOne({ token });
    // Vérifier si l'utilisateur existe
    if (!user) {
        console.log('User not found.');
        socket.emit('error', 'User not found.');
        await client.close();
        return;
    }
    const userInfo = {
        ready: false, // Prêt à jouer ou non
        username: user.username, // Nom d'utilisateur pour affichage
        level: user.lvl, // Niveau de l'utilisateur, supposons que cela existe dans votre modèle d'utilisateur
    };

    console.log("user",user);
    console.log("userInfo",userInfo);

    const invitations = await db.collection('gameInvites').find({
        'invitedUser.id': user._id,
        status: 'accepted'
    }).toArray();

    let foundRoom = false;

    for (let invitation of invitations) {
        if (waitingRoomsForFriends.has(invitation.invitingUser.id.toString())) {
            const room = waitingRoomsForFriends.get(invitation.invitingUser.id.toString());
            // Vérifier si la salle est celle attendue pour le jeu invité
            if (room.gameId.toString() === invitation.gameId.toString()) {
                // Faire rejoindre la socket à la room
                socket.join(room.roomId);

                // Mettre à jour le statut du joueur dans la room
                room.players[user._id.toString()] = { ready: false, ...userInfo};
                waitingRoomsForFriends.set(invitation.invitingUser.id.toString(), room);

                // Émettre tout l'objet room à la roomId
                io.to(room.roomId).emit('join waiting room response', room);

                foundRoom = true;
                console.log(`User ${user.username} joined the waiting room for game ${room.gameId}`);
                break;
            }
        }
    }

    if (!foundRoom) {
        const latestGameCreatedByUser = await db.collection('games').find({
            creator_id: user._id
        }).sort({ createdAt: -1 }).limit(1).next();
        // Si aucune salle d'attente correspondante n'est trouvée, créer une nouvelle salle
        const newRoomId = `friend_${user._id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newRoom = {
            gameId: latestGameCreatedByUser._id, // Utiliser le premier jeu invité comme référence
            roomId: newRoomId,
            gameName: latestGameCreatedByUser.game_name, // Nom de la partie
            players: { [user._id.toString()]: { ready: false, ...userInfo } }
        };

        // Faire rejoindre la socket à la nouvelle room
        socket.join(newRoomId);

        waitingRoomsForFriends.set(user._id.toString(), newRoom);

        // Émettre l'objet room au client
        socket.emit('join waiting room response', newRoom);
        console.log("all waiting rooms",waitingRoomsForFriends);
    }

    await client.close();
}

async function createGame(roomId,playerTokens, playersSocketIds, gameId){

    try {
        await client.connect();
        const db = client.db();
        let player1Token = playerTokens[0];
        let player2Token = playerTokens[1];
        let player1SocketId = playersSocketIds[0];
        let player2SocketId = playersSocketIds[1];

        let playersInfo = [];
        for (let token of playerTokens) {
            let userInfo = await db.collection('users').findOne({token: token});
            if (userInfo) {
                playersInfo.push(userInfo);
            }
        }

        if (playersInfo.length === 2) {
            const user = await db.collection('users').findOne({token: player1Token});
            const user2 = await db.collection('users').findOne({token: player2Token});

            if (gameId === undefined) {
                const newGame = await db.collection('games').insertOne({
                    fog_of_war_on_or_off: false, // ou true, selon la logique de votre jeu
                    creator_id: user.username, // ID de l'utilisateur qui a créé la partie
                    typeGame: 'withFriends', // Type de partie
                    game_name: 'New Game', // Nom de la partie, peut-être fourni par l'utilisateur
                    createdAt: new Date()
                });
                gameId = newGame.insertedId;
            }
            let config = {
                typeGame: 'withFriends',
            }

            console.log("gameId WHEN CREATING GAAAAAMMMMEEEEE HALO: ", gameId);
            // Créer un nouveau GameModel
            let gameModel = new GameModel(config);
            let actionController = new ActionController(gameModel);

            // Stocker l'instance de GameModel dans la map
            games.set(gameId.toString(), {
                gameModel,
                actionController,
                roomId,
                playerTokens,
                player2Token,
                user1_id: user._id,
                user2_id: user2._id,
                player1Token
            });

            // Persister le plateau de jeu
            let gameBoardId = await createGameDb(gameId, playersInfo, gameModel, db); // puis on fournit les token des 2 users pour pouvoir persister leur index dans la db
            let characters = await retrieveCharacterFromDb(db, gameBoardId);

            //envoyer les informations de la partie aux joueurs via une fonction où y'a la socket id en paramètre, gameId et gameModel
            console.log("envoie à player1SocketId : ", player1SocketId);

            let playerArrayToSend1 = new PlayerManager();
            let playerArrayToSend2 = new PlayerManager();

            console.log(gameModel.player_array.getPlayer(1).name);
            console.log(gameModel.player_array.getPlayer(2).name);

            playerArrayToSend1.addPlayer(new GamePlayer(gameModel.player_array.getPlayer(1).name, gameModel.player_array.getPlayer(1).position, gameModel.player_array.getPlayer(1).nbWalls));
            playerArrayToSend2.addPlayer(new GamePlayer(gameModel.player_array.getPlayer(2).name, gameModel.player_array.getPlayer(2).position, gameModel.player_array.getPlayer(2).nbWalls));
            let playableSquareWhereEnemyIsFor1 = gameModel.playable_squares.getPlayableSquare(gameModel.player_array.getPlayer(2).position.row, gameModel.player_array.getPlayer(2).position.col);
            let playableSquareWhereEnemyIsFor2 = gameModel.playable_squares.getPlayableSquare(gameModel.player_array.getPlayer(1).position.row, gameModel.player_array.getPlayer(1).position.col);
            if (playableSquareWhereEnemyIsFor1.visibility <= 0) {
                playerArrayToSend1.addPlayer(new GamePlayer(gameModel.player_array.getPlayer(2).name, gameModel.player_array.getPlayer(2).position, gameModel.player_array.getPlayer(2).nbWalls));
            }
            if (playableSquareWhereEnemyIsFor2.visibility >= 0) {
                playerArrayToSend2.addPlayer(new GamePlayer(gameModel.player_array.getPlayer(1).name, gameModel.player_array.getPlayer(1).position, gameModel.player_array.getPlayer(1).nbWalls));
            }

            let PlayableSquareObfuscedOne = gameModel.playable_squares.getAllPlayableSquares();
            PlayableSquareObfuscedOne.forEach((square) => {
                if(square.visibility < 0){square.visibility = -1;}
                if(square.visibility > 0){square.visibility = 1;}
            });
            let PlayableSquareObfuscedTwo = gameModel.playable_squares.getAllPlayableSquares();
            PlayableSquareObfuscedTwo.forEach((square) => {
                if(square.visibility < 0){square.visibility = -1;}
                if(square.visibility > 0){square.visibility = 1;}
            });

            let gamePlayerOne = {
                gameId: gameId, // ID de la partie
                gameBoardId: gameBoardId, // ID du plateau de jeu
                nbLignes: gameModel.nbLignes, // Nombre de lignes
                nbColonnes: gameModel.nbColonnes, // Nombre de colonnes
                player_array: playerArrayToSend1.getAllPlayers(),
                horizontal_Walls: gameModel.horizontal_Walls.getAllWalls(),
                vertical_Walls: gameModel.vertical_Walls.getAllWalls(),
                playable_squares: PlayableSquareObfuscedOne,
                currentPlayer: gameModel.currentPlayer,
                roundCounter: gameModel.roundCounter,
                winner: gameModel.winner,
                typeGame: gameModel.typeGame,
                roomId: roomId,
                test: "pla1",
                socketId: player1SocketId,
                ownIndexPlayer: characters[0].currentPlayerIndex
            };
            let gamePlayerTwo = {
                gameId: gameId, // ID de la partie
                gameBoardId: gameBoardId, // ID du plateau de jeu
                nbLignes: gameModel.nbLignes, // Nombre de lignes
                nbColonnes: gameModel.nbColonnes, // Nombre de colonnes
                player_array: playerArrayToSend2.getAllPlayers(),
                horizontal_Walls: gameModel.horizontal_Walls.getAllWalls(),
                vertical_Walls: gameModel.vertical_Walls.getAllWalls(),
                playable_squares: PlayableSquareObfuscedTwo,
                currentPlayer: gameModel.currentPlayer,
                roundCounter: gameModel.roundCounter,
                winner: gameModel.winner,
                typeGame: gameModel.typeGame,
                roomId: roomId,
                test: "pla2",
                socketId: player2SocketId,
                ownIndexPlayer: characters[1].currentPlayerIndex
            };
            return {gamePlayerOne, gamePlayerTwo};
        }
    }
    catch (error) {
        console.error('Error setting up game for friends', error);
        // Gérer l'erreur
    }

}




