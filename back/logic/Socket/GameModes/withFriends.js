const {MongoClient} = require("mongodb");
const {MONGO_URL} = require("../../Utils/constants");
const {GameModel} = require("../../Model/Game/GameModel");
const {ActionController} = require("../../Controller/actionController");
const client = new MongoClient(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const {setUpPositionRealBot, createGameDb,
    updatePositionCharacter,
    manageBotMove,
    updateCurrentPlayerFromDb,
    updateWallsAndVisibilityFromBd
} = require("../../Controller/gameController");




const games = new Map();
const waitingPlayers = new Map(); // Clé : token de l'utilisateur, Valeur : ID de la room
const playerRoles = new Map(); // Clé : ID de la room, Valeur : tableau des tokens des joueurs avec leur rôle


module.exports = (io, socket) => {
    socket.on('joinGameWithFriends', async (token) => {
        if (!token) return;
        const tokenParsed = JSON.parse(token).token;
        let roomId;
        await client.connect();
        const db = client.db();

        // Trouvez une salle avec exactement un joueur
        const existingRoomId = Array.from(waitingPlayers.values()).find(roomId => io.sockets.adapter.rooms.get(roomId)?.size === 1);

        if (existingRoomId) {
            roomId = existingRoomId;
            socket.join(roomId);

            // Récupérer les tokens des deux joueurs
            const entries = [...waitingPlayers.entries()];
            const player1Entry = entries.find(([_, rId]) => rId === existingRoomId);
            const player1Token = player1Entry ? player1Entry[0] : null; // Le token du premier joueur
            const player2Token = tokenParsed; // Le token du joueur actuel

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
                    games.set(gameId.toString(), {gameModel, actionController});

                    // Persister le plateau de jeu
                    let gameBoardId = await createGameDb(gameId, playersInfo, gameModel, db); // puis on fournit les token des 2 users pour pouvoir persister leur index dans la db

                    // Envoyer les informations de la partie aux joueurs
                    io.to(roomId).emit('opponentFound', JSON.stringify({
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
                        typeGame: gameModel.typeGame
                    }));
                }

            } catch (error) {
                console.error('Error setting up game for friends', error);
                // Gérer l'erreur
            }
        } else {
            roomId = socket.id;  // Créez une nouvelle "salle" avec l'ID du socket du joueur
            socket.join(roomId);
            waitingPlayers.set(tokenParsed, roomId);  // Ajoutez le joueur aux joueurs en attente

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

    // Ajoutez ici d'autres gestionnaires pour startFriendGame, etc.
};
