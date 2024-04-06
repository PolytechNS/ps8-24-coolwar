const {GameModel} = require("../../Model/Game/GameModel");
const {ActionController} = require("../../Controller/actionController");
const {setupBotController, playBot, nextMoveBotController} = require("../../Controller/botController");
const {addExpToPlayerWithBot} = require("../../Controller/userController");
const {setUpPositionRealBot, createGameDb,
    updatePositionCharacter,
    manageBotMove,
    updateWinnerAndLooserBot,
    updateCurrentPlayerFromDb,
    updateWallsAndVisibilityFromBd, retrieveCharacterFromDb
} = require("../../Controller/gameUserController");
const {MongoClient, ObjectId} = require("mongodb");
const {MONGO_URL, withBot} = require("../../Utils/constants");
const {Wall} = require("../../Model/Objects/Wall");
const {WallDictionary} = require("../../Model/Objects/WallDictionary");
const client = new MongoClient(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });



let actionController = null;
const games = new Map();
let actionIsTrigger = false;


module.exports = (io, socket) => {
    socket.on('getGameWithBot', async (userToken) => {
        try {
            // Créer une nouvelle partie dans la base de données
            await client.connect();
            const db = client.db();

            const user = await db.collection('users').findOne({ token: userToken });
            const newGame = await db.collection('games').insertOne({
                fog_of_war_on_or_off: false, // ou true, selon la logique de votre jeu
                creator_id: user.username , // ID de l'utilisateur qui a créé la partie
                typeGame: 'withBot', // Type de partie
                game_name: 'New Game' // Nom de la partie, peut-être fourni par l'utilisateur
            });
            const gameId = newGame.insertedId;

            // Créer un nouveau GameModel
            let gameModel = new GameModel();
            let actionController = new ActionController(gameModel);


            // Stocker l'instance de GameModel dans la map
            games.set(gameId.toString(), { gameModel, actionController });


            // Gestion Bot
            let botIndex = gameModel.currentPlayer;

            //on met +1 au current player car 1 c'est nous et 2 c'est le bot
            setupBotController(botIndex).then(async (positionBot) => {
                setUpPositionRealBot(positionBot,gameModel,botIndex);
                //afficher les player de gameModel

                let playersInfo = [await db.collection('users').findOne({token: userToken}),{_id:-1}];
                let gameBoardId = await createGameDb(gameId,playersInfo,gameModel);
                let characters =await retrieveCharacterFromDb(db,gameBoardId);
                // Envoyer l'état initial du jeu au client
                socket.emit('getGameWithBotResponse', JSON.stringify({
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
                    winner : gameModel.winner,
                    typeGame: 'withBot',
                    ownIndexPlayer: characters[0].currentPlayerIndex
                }));

            });
            // Persister le plateau de jeu

        } catch (error) {
            console.error('Error creating game model', error);
            // Gérer l'erreur, par exemple en envoyant un message d'erreur au client
        }
    });


    socket.on('moveCharacterWithBot', async(data)=>{
        if(actionIsTrigger){return false;}
        else {actionIsTrigger = true;}
        const dataParse = JSON.parse(data);
        console.log("dataParse : ",dataParse);
        try {
            //On récupère la partie dans la map
            let actionController = games.get(dataParse.gameId).actionController;
            let gameModel = games.get(dataParse.gameId).gameModel;

            //move le personnage on met 1 car on part du principe que le joueur est le premier
            let responseBoolean = actionController.moveCharacter(gameModel.currentPlayer,dataParse.row,dataParse.col);
            await client.connect();
            const db = client.db();
            //on récupère les carrés jouables
            const gameIdDb = await db.collection('games').findOne({ _id: new ObjectId(dataParse.gameId) });
            const gameBoardIdDb = await db.collection('gameboards').findOne({ gameId: gameIdDb._id });

            //on met à jour la position du joueur dans la bd
            let gameBoard = await updatePositionCharacter(dataParse,db,gameModel);
            //on met à jour le joueur actuel dans la bd
            await updateCurrentPlayerFromDb(gameBoard,db,gameModel);
            if(responseBoolean){
                ///GESTION BOT --action de bouger
                manageBotMove(gameModel).then(async (nextBotmove) => {
                    console.log("nextBotmove : ", nextBotmove);
                    let actionBOT = nextBotmove.action;
                    if (actionBOT === "move") {
                        let positionBOT = nextBotmove.value;
                        let choiceBotParsed = {row: positionBOT.toString().charAt(0), col:positionBOT.toString().charAt(1), gameId: dataParse.gameId};
                        console.log(choiceBotParsed);
                        console.log("BOT CHOICE : MOVE IN MOVECHARACTER");
                        console.log("ACTION BOT : ", actionBOT);
                        console.log("POSITION BOT : ", positionBOT);
                        actionController.moveCharacter(2, positionBOT.toString().charAt(0), positionBOT.toString().charAt(1));
                        //on met à jour la position du joueur dans la bd
                        gameBoard = await updatePositionCharacter(choiceBotParsed,db,gameModel);
                        //on met à jour le joueur actuel dans la bd
                        await updateCurrentPlayerFromDb(gameBoard, db, gameModel);
                        socket.emit('moveCharacterWithBotResponse',responseBoolean);
                        actionIsTrigger = false;
                    } else if (actionBOT === "wall") {
                        let positionBOT = nextBotmove.value[0];
                        let walltypeBOT = nextBotmove.value[1];
                        let wallPosition = [];
                        if (walltypeBOT === 1) {
                            wallPosition = {wallList: [positionBOT.toString().charAt(0) + 'X' + positionBOT.toString().charAt(1) + 'XV',(parseInt(positionBOT.toString().charAt(0))+1) + 'X' + (parseInt(positionBOT.toString().charAt(1))) + 'XV']};
                            console.log(wallPosition);
                        } else if (walltypeBOT === 0) {
                            wallPosition = {wallList: [positionBOT.toString().charAt(0) + 'X' + positionBOT.toString().charAt(1) + 'XH', (positionBOT.toString().charAt(0)) + 'X' + (parseInt(positionBOT.toString().charAt(1))+1) + 'XH']};
                            console.log(wallPosition);
                        }
                        currentPlayerID = gameModel.currentPlayer;
                        console.log("LOOK HERE ------------->")
                        console.log(gameBoardIdDb);
                        console.log(currentPlayerID);
                        const BotPlayerBD = await db.collection('character').findOne({ gameBoardId: new ObjectId(dataParse.gameBoardId), currentPlayerIndex: currentPlayerID });
                        console.log("BOTPLAYERBD : ", BotPlayerBD);
                        actionController.placeWall(wallPosition, 2);
                        console.log("CURRENT PLAYER AFTER PLACEWALL AND AFTER BOT MOVE --> ", gameModel.currentPlayer);
                        //on met à jour le nombre de murs restants dans la bd pour le joueur
                        await updateWallsAndVisibilityFromBd(wallPosition, BotPlayerBD, gameBoardIdDb, gameModel, db);
                        //on met à jour le joueur actuel dans la bd
                        await updateCurrentPlayerFromDb(gameBoardIdDb, db, gameModel);
                        socket.emit('moveCharacterWithBotResponse',responseBoolean);
                        actionIsTrigger = false;
                    }
                });
            }
            else{
                socket.emit('moveCharacterWithBotResponse',responseBoolean);
                actionIsTrigger = false;
            }
        }
        catch (error) {
            console.error('Error moving character', error);
            socket.emit('moveCharacterWithBotResponse', false);
            actionIsTrigger = false;
        }
    });

    socket.on('placeWallWithBot', async (datas) => {
        if(actionIsTrigger){return false;}
        else {actionIsTrigger = true;}
        console.log("PLACE WALL WITH BOT");
        console.log(datas);
        try {
            let wallDataDeserialized = JSON.parse(datas);
            let actionController = games.get(wallDataDeserialized.gameId).actionController;
            let gameModel = games.get(wallDataDeserialized.gameId).gameModel;

            let currentPlayerID = gameModel.currentPlayer;
            await client.connect();
            const db = client.db();
            // Récupérer le joueur actuel à partir de la base de données

            const realPlayerBD = await db.collection('character').findOne({ gameBoardId: new ObjectId(wallDataDeserialized.gameBoardId), currentPlayerIndex: currentPlayerID });
            console.log("realPlayerBD : ", realPlayerBD);
            const gameIdDb = await db.collection('games').findOne({ _id: new ObjectId(wallDataDeserialized.gameId) });
            const gameBoardIdDb = await db.collection('gameboards').findOne({ gameId: gameIdDb._id });

            //on essaye de placer le mur
            let responseBoolean = actionController.placeWall(wallDataDeserialized,currentPlayerID);
            console.log("CURRENT PLAYER AFTER PLACEWALL AND BEFORE BOT MOVE --> ", gameModel.currentPlayer);
            //on met à jour le nombre de murs restants dans la bd pour le joueur
            await updateWallsAndVisibilityFromBd(wallDataDeserialized, realPlayerBD, gameBoardIdDb, gameModel, db);
            //on met à jour le joueur actuel dans la bd
            await updateCurrentPlayerFromDb(gameBoardIdDb, db, gameModel);

            //si les murs du joueur sont placés
            if(responseBoolean){
                //on demande le
                manageBotMove(gameModel).then(async (nextBotmove) => {
                    console.log("nextBotmove : ", nextBotmove);
                    let actionBOT = nextBotmove.action;

                    if (actionBOT === "move") {
                        let positionBOT = nextBotmove.value;
                        console.log("BOT CHOICE : MOVE IN PLACEWALL");
                        let availableBotMove = actionController.moveCharacter(2, positionBOT.toString().charAt(0), positionBOT.toString().charAt(1));
                        let choiceBotParsed = {row: positionBOT.toString().charAt(0), col:positionBOT.toString().charAt(1), gameId: wallDataDeserialized.gameId};

                        //on met à jour le joueur actuel dans la bd
                        let gameBoard = await updatePositionCharacter(choiceBotParsed,db,gameModel);
                        //on met à jour le joueur actuel dans la bd
                        await updateCurrentPlayerFromDb(gameBoard, db, gameModel);
                        socket.emit('placeWallWithBotResponse', responseBoolean);
                        actionIsTrigger = false;
                    }
                    else if (actionBOT === "wall") {
                        let positionBOT = nextBotmove.value[0];
                        let walltypeBOT = nextBotmove.value[1];
                        let wallPosition = [];
                        if (walltypeBOT === 1) {
                            wallPosition = {wallList: [positionBOT.toString().charAt(0) + 'X' + positionBOT.toString().charAt(1) + 'XV',(parseInt(positionBOT.toString().charAt(0))+1) + 'X' + (parseInt(positionBOT.toString().charAt(1))) + 'XV']};
                            console.log(wallPosition);
                        } else if (walltypeBOT === 0) {
                            wallPosition = {wallList: [positionBOT.toString().charAt(0) + 'X' + positionBOT.toString().charAt(1) + 'XH', (positionBOT.toString().charAt(0)) + 'X' + (parseInt(positionBOT.toString().charAt(1))+1) + 'XH']};
                            console.log(wallPosition);
                        }
                        currentPlayerID = gameModel.currentPlayer;
                        const BotPlayerBD = await db.collection('character').findOne({ gameBoardId: new ObjectId(wallDataDeserialized.gameBoardId), currentPlayerIndex: currentPlayerID });
                        actionController.placeWall(wallPosition, 2);
                        console.log("CURRENT PLAYER AFTER PLACEWALL AND AFTER BOT MOVE --> ", gameModel.currentPlayer);

                        //on met à jour le nombre de murs restants dans la bd pour le joueur
                        console.log("-----------------------------------------------------------------------------");
                        console.log("playerID :",BotPlayerBD);
                        console.log("gameBoardIdDb : ",gameBoardIdDb);
                        console.log("gameModel : ",gameModel);
                        console.log("-----------------------------------------------------------------------------");
                        await updateWallsAndVisibilityFromBd(wallPosition, BotPlayerBD, gameBoardIdDb, gameModel, db);
                        //on met à jour le joueur actuel dans la bd
                        await updateCurrentPlayerFromDb(gameBoardIdDb, db, gameModel);
                        socket.emit('placeWallWithBotResponse', responseBoolean);
                        actionIsTrigger = false;

                    }
                });
            }
            else{
                socket.emit('placeWallWithBotResponse', responseBoolean);
                actionIsTrigger = false;
            }
            // Envoyer la réponse au client

        }
        catch (error) {
            console.error('Error placing wall', error);
            socket.emit('placewallResponse', false);
            actionIsTrigger = false;
        }
    });


    socket.on('getplayerposition',(data)=>{
        let dataParse = JSON.parse(data);
        let actionController = games.get(dataParse.gameId).actionController;
        let gameModel = games.get(dataParse.gameId).gameModel;
        let response = actionController.getPlayerPosition(gameModel.currentPlayer);
        console.log("response get player position", response);
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
    socket.on('checkWinner',(data)=>{
        let dataParse = JSON.parse(data);
        let actionController = games.get(dataParse.gameId).actionController;
        let response = actionController.checkWinner();
        if(response !==-1){
            let winner = response;
            let looser = (winner === 1) ? 2 : 1;
            let tokenPlayer1 = dataParse.token;
            addExpToPlayerWithBot(dataParse.token,withBot, winner);
            updateWinnerAndLooserBot(dataParse.gameId,winner);
        }
        socket.emit('checkWinnerResponse',response);
    });


    socket.on('updateGameModel', async ( data ) => {
        let datas = JSON.parse(data);
        console.log("UPDATE GAME MODEL");
        console.log(datas);
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
                games.set(gameId.toString(), { gameModel, actionController });
                let characters =await retrieveCharacterFromDb(db,gameBoardSaved._id);


                socket.emit('updateGameModelResponse', JSON.stringify({
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
                    ownIndexPlayer: characters[0].currentPlayerIndex
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


};
