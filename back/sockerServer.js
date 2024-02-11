// socketServer.js
const socketIo = require('socket.io');
const {GameModel} = require('./logic/Model/Game/GameModel.js');
const {ActionController} = require("./logic/Controller/actionController.js");
const { MongoClient } = require('mongodb');
const {MONGO_URL} = require("./logic/Utils/constants");
const client = new MongoClient(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });



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

        socket.on('get game model', async () => {
            try {
                // Créer une nouvelle partie dans la base de données
                await client.connect();
                const db = client.db();
                const newGame = await db.collection('games').insertOne({
                    fog_of_war_on_or_off: false, // ou true, selon la logique de votre jeu
                    game_name: 'New Game' // Nom de la partie, peut-être fourni par l'utilisateur
                });
                const gameId = newGame.insertedId;

                // Créer un nouveau GameModel
                const gameModel = new GameModel();

                // Persister le plateau de jeu
                const gameBoard = await db.collection('gameboards').insertOne({
                    gameId: gameId, // Lier le plateau de jeu à la partie
                    nbJoueursMax: gameModel.nbPlayers // Nombre maximum de joueurs
                    // autres données du plateau de jeu
                });
                const gameBoardId = gameBoard.insertedId;

                // Persister les murs et les cases en référençant l'ID du plateau de jeu
                const walls = [...gameModel.horizontal_Walls.getAllWalls(), ...gameModel.vertical_Walls.getAllWalls()];
                await db.collection('walls').insertMany(walls.map(wall => ({
                    ...wall,
                    gameBoardId: gameBoardId
                })));

                const squares = gameModel.playable_squares;
                await db.collection('squares').insertMany(squares.getAllPlayableSquares(square => ({
                    ...square,
                    gameBoardId: gameBoardId
                })));

                // Envoyer l'état initial du jeu au client
                socket.emit('game model', JSON.stringify({
                    gameId: gameId, // ID de la partie
                    gameBoardId: gameBoardId, // ID du plateau de jeu
                    nbLignes: gameModel.nbLignes, // Nombre de lignes
                    nbColonnes: gameModel.nbColonnes, // Nombre de colonnes
                    player_array: gameModel.player_array.getAllPlayers(),
                    horizontal_Walls: gameModel.horizontal_Walls.getAllWalls(),
                    vertical_Walls: gameModel.vertical_Walls.getAllWalls(),
                    playable_squares: gameModel.playable_squares.getAllPlayableSquares()




                }));
            } catch (error) {
                console.error('Error creating game model', error);
                // Gérer l'erreur, par exemple en envoyant un message d'erreur au client
            }
        });

        socket.on('update wall', async (data) => {
            try {
                try {
                    let actionController = new ActionController();
                    let responseBoolean = actionController.placeWall(data);
                }
                await client.connect();
                const db = client.db();
                const game = await db.collection('games').findOne({data: data.gameId});
                const gameBoard = await db.collection('gameboards').findOne({data: game.gameId});
                const walls = await db.collection('walls').findOne({data: gameBoard.gameBoardId});
                //update wall isPresent = true
                await db.collection('walls').updateOne({data: walls._id}, {$set: {isPresent: true}});

                // Envoyer l'état initial du jeu au client


            }catch (error) {
                console.error('Error updating wall', error);

                }

        });



        socket.on('save game', async (data) => {
            try {
                console.log('Received request to save game:');
                const userToken = data.token; // Utilisez le token pour identifier l'utilisateur
                const gameState = data.gameState; // L'état du jeu à sauvegarder

                // Récupérer l'ID de l'utilisateur à partir du token
                await client.connect();
                const db = client.db();
                const userId = await db.collection('users').findOne({ data: userToken});

                // Sauvegarder l'état du jeu avec l'ID de l'utilisateur
                await db.collection('savedGames').insertOne({
                    userId,
                    gameState, // Assurez-vous que gameState est un objet sérialisable
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
                let user = await db.collection('users').findOne({ userId });
                const savedGame = await db.collection('savedGames').findOne({ user });
                console.log('Saved game:', savedGame);
                if (savedGame) {
                    // Assumer que savedGame.gameState contient l'état du jeu sauvegardé
                    const gameState = savedGame.gameState;
                    socket.emit('loaded game', gameState);
                } else {
                    socket.emit('error', 'Aucune partie sauvegardée trouvée.');
                }
            } catch (error) {
                console.error('Erreur lors du chargement de la partie sauvegardée', error);
                socket.emit('error', 'Erreur lors du chargement de la partie.');
            }
        });



        socket.on('joinGame', () => {
            let responseBoolean = gameController.join()

            socket.emit('placewallResponse',responseBoolean);
        });

        socket.on('placewall', (wallData) => {
            let wallDataDeserialized = JSON.parse(wallData);
            let actionController = new ActionController();
            let responseBoolean = actionController.placeWall(wallDataDeserialized);
            socket.emit('placewallResponse',responseBoolean);
        });

        socket.on('moveCharacter', ()=>{

        });
    });

    return io;
};
