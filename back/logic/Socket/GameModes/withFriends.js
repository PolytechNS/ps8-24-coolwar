const {MongoClient, ObjectId} = require("mongodb");
const {MONGO_URL} = require("../../Utils/constants");
const {GameModel} = require("../../Model/Game/GameModel");
const {ActionController} = require("../../Controller/actionController");
const client = new MongoClient(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const {setUpPositionRealBot, createGameDb,
    updatePositionCharacter,
    manageBotMove,
    retrieveCharacterFromDb,
    updateCurrentPlayerFromDb,
    updateWallsAndVisibilityFromBd
} = require("../../Controller/gameController");




const games = new Map();
const waitingPlayers = new Map(); // Clé : token de l'utilisateur, Valeur : ID de la room
const socketIds = new Map(); // Nouvelle map pour stocker les ID des sockets des joueurs


module.exports = (io, socket) => {
    socket.on('joinGameWithFriends', async (token) => {
        if (!token) return;
        const tokenParsed = JSON.parse(token).token;
        let roomId;
        await client.connect();
        const db = client.db();

        // Trouvez une salle avec exactement un joueur

        socket.emit('test',socket.id);




        const existingRoomId = Array.from(waitingPlayers.values()).find(roomId => io.sockets.adapter.rooms.get(roomId)?.size === 1);
        console.log("existingRoomId",existingRoomId);
        if (existingRoomId) {
            roomId = existingRoomId;
            socket.join(roomId);

            // Enregistrer l'ID de la socket pour chaque joueur
            socketIds.set(tokenParsed, socket.id);

            // Récupérer les tokens et les ID de socket des deux joueurs
            const entries = [...waitingPlayers.entries()]; // récupérer les entrées de la map

            const player1Entry = entries.find(([_, rId]) => rId === existingRoomId);// Récupérer l'entrée correspondant à la salle
            const player1Token = player1Entry ? player1Entry[0] : null; //si l'entrée existe, récupérer le token
            const player1SocketId = player1Token ? socketIds.get(player1Token) : null; // Récupérer l'ID de la socket du premier joueur
            const player2Token = tokenParsed;
            const player2SocketId = socket.id; // L'ID de la socket du joueur actuel

            //afficher les socket id des 2 joueurs
            console.log("socket dans socketIds",socketIds);
            if (player1Token && player2Token && player1SocketId && player2SocketId && player1Token !== player2Token) {
                // Les vérifications sont passées, continuez avec la logique du jeu
            } else {
                console.error("Invalid tokens or socket IDs for the players.");
                return;
            }
            // Vérifiez si les deux tokens sont disponibles
            if (player1Token && player2Token && player1Token !== player2Token) {
                //permet de vérifier si les token sont bien récupérés et sont différents
            } else {
                // Gérez le cas où les tokens ne sont pas correctement récupérés ou sont identiques
                console.error("Invalid tokens for the players.");
                return;
            }

            // Supprimer les tokens de la liste d'attente
            waitingPlayers.delete(player1Token);
            waitingPlayers.delete(player2Token);

            const playerTokens = [player1Token, player2Token];

            try {
                await client.connect();
                const db = client.db();

                let playersInfo = [];
                for (const token of playerTokens) {
                    const userInfo = await db.collection('users').findOne({ token: token });
                    console.log("userInfo : ", userInfo);
                    if (userInfo) {
                        playersInfo.push(userInfo);
                    }
                }

                if (playersInfo.length === 2) {
                    const user = await db.collection('users').findOne({token: tokenParsed});
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
                    // Envoyer les informations de la partie aux joueurs
                    io.to(player1SocketId).emit('opponentFound', JSON.stringify({
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
                    }));
                    console.log("envoie à player2SocketId : ", player2SocketId);

                    io.to(player2SocketId).emit('opponentFound', JSON.stringify({
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
                    }));


                }

            } catch (error) {
                console.error('Error setting up game for friends', error);
                // Gérer l'erreur
            }
        } else {
            roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${socket.id}`;
            console.log("roomId CREE",roomId);
            socket.join(roomId);
            waitingPlayers.set(tokenParsed, roomId);
            socketIds.set(tokenParsed, socket.id); // Enregistrer l'ID de la socket lors de la mise en attente
        }
    });

    socket.on('disconnect', () => {
        // Gérer la déconnexion de l'utilisateur
        // Vous pourriez vouloir informer l'autre joueur, ou supprimer la salle d'attente si nécessaire
        const roomId = waitingPlayers.get(socket.handshake.query.token);
        if (roomId) {
            waitingPlayers.delete(socket.handshake.query.token);
            socket.leave(roomId);
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
            //récupérer les playable squares
            let playableSquares = await db.collection('squares').find({gameBoardId: gameBoard._id}).toArray();
            //les afficher

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
                await updateWallsAndVisibilityFromBd(wallDataDeserialized,playerBd,gameBoardIdDb,gameModel,db,squareGameModel);

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

    socket.on('checkWinnerWithFriends',(data)=>{
        let dataParse = JSON.parse(data);
        console.log("CHECK WINNER WITH FRIENDS : ",dataParse);
        let actionController = games.get(dataParse.gameId).actionController;
        let response = actionController.checkWinner();
        socket.emit('checkWinnerWithFriendsResponse',response);
    });

    socket.on('updateGameModelWithFriends', async ( data ) => {
        let datas = JSON.parse(data);
        let gameId = datas[2];
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
            } else {
                console.log(' UPDATE GAME MODEL ERROR');
                socket.emit('error', 'No saved game found for this user.');
            }
        } catch (error) {
            console.error('Error loading saved game', error);
            socket.emit('error', 'Error loading the game.');
        }
    });

    // Ajoutez ici d'autres gestionnaires pour startFriendGame, etc.
};



