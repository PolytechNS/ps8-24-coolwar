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
    updateWallsAndVisibilityFromBd
} = require("../../Controller/gameUserController.js");
const {verifyMessage} = require("../../Controller/Chat/chatController.js");
const {addExpToPlayerWithBot,manageEndGameUser,checkAchievements} = require("../../Controller/userController.js");



/*
const games = new Map();
const waitingPlayers = new Map(); // Clé : token de l'utilisateur, Valeur : ID de la room
const socketIds = new Map(); // Nouvelle map pour stocker les ID des sockets des joueurs


 */

// Variables globales pour la gestion des rooms et des joueurs
const games = new Map();
const waitingPlayersForInstantGame = new Map();
const waitingRoomsForFriends = new Map();
const socketIds = new Map();


module.exports = (io, socket) => {
    socket.on('joinGameWithFriends', async (data) => {
        let dataParse = JSON.parse(data);
        let token = dataParse.token;
        let gameMode = dataParse.gameMode;
        console.log("JOIN GAME WITH FRIENDS",dataParse);
        if (gameMode === 'playNow') {
            joinInstantGame(io, socket, token);
        }
        // Jouer avec un ami
        else if (gameMode === 'waitingForFriends') {
            joinGameWithFriend(io, socket, dataParse);
        }

    });

    socket.on('disconnect', async () => {
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

        // Traitement supplémentaire pour les joueurs déjà en partie
        // Vous devrez ajuster cette partie en fonction de la logique spécifique de votre jeu
        // Par exemple, notifier l'autre joueur, terminer la partie, etc.
    });



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

    //ready
    socket.on('ready', async (data) => {
        const { token, gameId } = JSON.parse(data);
        console.log("les data ",data);
        console.log(`Player with token ${token} is ready for game ${gameId}`);
        // Vérifier si la room existe
        if (waitingRoomsForFriends.has(gameId)) {
            const room = waitingRoomsForFriends.get(gameId);

            // Marquer le joueur comme prêt
            room.players[token].ready = true;

            // Vérifier si tous les joueurs sont prêts
            const allPlayersReady = Object.values(room.players).every(player => player.ready);

            if (allPlayersReady) {
                // Tous les joueurs sont prêts
                console.log(`All players are ready for game ${gameId}. Starting game...`);

                // Émettre un événement pour démarrer le jeu
                io.to(`game_${gameId}`).emit('startGameWithFriend', { gameId });

                // Ici, vous pourriez aussi initialiser la partie dans votre logique de serveur,
                // comme en créant un état de jeu initial ou en chargeant la configuration de la partie.

                // Optionnel: Nettoyer la room après le démarrage de la partie
                // Cela dépend de votre logique de jeu et de comment vous gérez les états de partie.
                waitingRoomsForFriends.delete(gameId);

            } else {
                // Pas tous les joueurs sont prêts

                console.log(`Player with token ${token} is ready for game ${gameId}. Waiting for others...`);

                // Émettre un événement pour indiquer qu'un joueur est prêt, si nécessaire
                // Cela pourrait être utile pour mettre à jour l'UI côté client
                //io.to(`game_${gameId}`).emit('playerReady', { token, ready: true });
            }

            // Ne pas oublier de mettre à jour la room dans la map après modification
            waitingRoomsForFriends.set(gameId, room);
        }
    });


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
            let gameBoard = await updatePositionCharacter(dataParse,db,gameModel,squareGameModel);

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
            console.log("playerBd : ", playerBd);
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
            let looser = (winner === 1) ? 2 : 1;
            await manageEndGameUser(dataParse.gameId,winner,looser);
            await updateWinnerAndLooser(dataParse.gameId,winner);
            let achievementsUnlockedPl1 = await checkAchievements(games.get(dataParse.gameId).player1Token);
            //faudrait que ça retourne ls achievements du joueur 1
            let achievementsUnlockedPl2 = await checkAchievements(games.get(dataParse.gameId).player2Token);

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

                io.to(player1SocketId).emit('updateGameModelWithFriendsResponse', JSON.stringify({
                    gameId: gameBoardSaved.gameId, // ID de la partie
                    gameBoardId: gameBoardSaved._id, // ID du plateau de jeu
                    nbLignes: gameModel.nbLignes, // Nombre de lignes
                    nbColonnes: gameModel.nbColonnes, // Nombre de colonnes
                    player_array: gameModel.player_array.getAllPlayers(),
                    horizontal_Walls: gameModel.horizontal_Walls.getAllWalls(),
                    vertical_Walls: gameModel.vertical_Walls.getAllWalls(),
                    playable_squares: gameModel.playable_squares.getAllPlayableSquares(),
                    currentPlayer: gameModel.currentPlayer,
                    roundCounter: gameModel.roundCounter,
                    winner : gameModel.winner,
                    typeGame: gameModel.typeGame,
                    roomId: datas.roomId,
                    test:"pla1",
                    ownIndexPlayer: characters[0].currentPlayerIndex

                }));

                io.to(player2SocketId).emit('updateGameModelWithFriendsResponse', JSON.stringify({
                    gameId: gameBoardSaved.gameId, // ID de la partie
                    gameBoardId: gameBoardSaved._id, // ID du plateau de jeu
                    nbLignes: gameModel.nbLignes, // Nombre de lignes
                    nbColonnes: gameModel.nbColonnes, // Nombre de colonnes
                    player_array: gameModel.player_array.getAllPlayers(),
                    horizontal_Walls: gameModel.horizontal_Walls.getAllWalls(),
                    vertical_Walls: gameModel.vertical_Walls.getAllWalls(),
                    playable_squares: gameModel.playable_squares.getAllPlayableSquares(),
                    currentPlayer: gameModel.currentPlayer,
                    roundCounter: gameModel.roundCounter,
                    winner : gameModel.winner,
                    typeGame: gameModel.typeGame,
                    roomId: datas.roomId,
                    test:"pla2",
                    ownIndexPlayer: characters[1].currentPlayerIndex
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


async function joinInstantGame(io, socket, tokenParsed) {
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

async function joinGameWithFriend(io, socket, token) {
    // Implementation for "waitingForFriends" mode
    const roomId = `friend_${token}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    waitingRoomsForFriends.set(token, roomId);
    socketIds.set(token, socket.id);

    socket.join(roomId);

    socket.emit('friendGameCreated', { roomId });
    // Now, you need to handle the process by which the friend joins the room
    // using the room ID. This could be done via another socket event.
}


async function createGame(roomId,playerTokens, playersSocketIds){

    try {
        await client.connect();
        const db = client.db();
        let player1Token = playerTokens[0];
        let player2Token = playerTokens[1];
        let player1SocketId = playersSocketIds[0];
        let player2SocketId = playersSocketIds[1];

        let playersInfo = [];
        for (const token of playerTokens) {
            const userInfo = await db.collection('users').findOne({ token: token });
            if (userInfo) {
                playersInfo.push(userInfo);
            }
        }

        if (playersInfo.length === 2) {
            const user = await db.collection('users').findOne({token: player1Token});
            const newGame = await db.collection('games').insertOne({
                fog_of_war_on_or_off: false, // ou true, selon la logique de votre jeu
                creator_id: user.username, // ID de l'utilisateur qui a créé la partie
                typeGame: 'withFriends', // Type de partie
                game_name: 'New Game' // Nom de la partie, peut-être fourni par l'utilisateur
            });
            const gameId = newGame.insertedId;

            let config = {
                typeGame: 'withFriends',
            }
            // Créer un nouveau GameModel
            let gameModel = new GameModel(config);

            let actionController = new ActionController(gameModel);


            // Stocker l'instance de GameModel dans la map
            games.set(gameId.toString(), {gameModel, actionController,roomId,player1Token,player2Token });

            // Persister le plateau de jeu
            let gameBoardId = await createGameDb(gameId, playersInfo, gameModel, db); // puis on fournit les token des 2 users pour pouvoir persister leur index dans la db
            let characters =await retrieveCharacterFromDb(db,gameBoardId);

            //envoyer les informations de la partie aux joueurs via une fonction où y'a la socket id en paramètre, gameId et gameModel
            console.log("envoie à player1SocketId : ", player1SocketId);

            let gamePlayerOne = {
                gameId: gameId, // ID de la partie
                gameBoardId: gameBoardId, // ID du plateau de jeu
                nbLignes: gameModel.nbLignes, // Nombre de lignes
                nbColonnes: gameModel.nbColonnes, // Nombre de colonnes
                player_array: gameModel.player_array.getAllPlayers(),
                horizontal_Walls: gameModel.horizontal_Walls.getAllWalls(),
                vertical_Walls: gameModel.vertical_Walls.getAllWalls(),
                playable_squares: gameModel.playable_squares.getAllPlayableSquares(),
                currentPlayer: gameModel.currentPlayer,
                roundCounter: gameModel.roundCounter,
                winner: gameModel.winner,
                typeGame: gameModel.typeGame,
                roomId: roomId,
                test:"pla1",
                socketId: player1SocketId,
                ownIndexPlayer: characters[0].currentPlayerIndex
            };
            let gamePlayerTwo = {
                gameId: gameId, // ID de la partie
                gameBoardId: gameBoardId, // ID du plateau de jeu
                nbLignes: gameModel.nbLignes, // Nombre de lignes
                nbColonnes: gameModel.nbColonnes, // Nombre de colonnes
                player_array: gameModel.player_array.getAllPlayers(),
                horizontal_Walls: gameModel.horizontal_Walls.getAllWalls(),
                vertical_Walls: gameModel.vertical_Walls.getAllWalls(),
                playable_squares: gameModel.playable_squares.getAllPlayableSquares(),
                currentPlayer: gameModel.currentPlayer,
                roundCounter: gameModel.roundCounter,
                winner: gameModel.winner,
                typeGame: gameModel.typeGame,
                roomId: roomId,
                test:"pla2",
                socketId: player2SocketId,
                ownIndexPlayer: characters[1].currentPlayerIndex
            };
            return {gamePlayerOne,gamePlayerTwo};
        }


    } catch (error) {
        console.error('Error setting up game for friends', error);
        // Gérer l'erreur
    }

}




