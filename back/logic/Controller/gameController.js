const {ObjectId} = require("mongodb");
const {playBot} = require("./botController");

async function createGameDb(gameId,gameModelGlobal,db) {
    const gameBoard = await db.collection('gameboards').insertOne({
        gameId: gameId, // Lier le plateau de jeu à la partie
        nbJoueursMax: gameModelGlobal.nbPlayers, // Nombre maximum de joueurs
        roundCounter: gameModelGlobal.roundCounter, // Compteur de tours
        currentPlayer: gameModelGlobal.currentPlayer, // Joueur actuel
        winner : gameModelGlobal.winner,
        lastChance: gameModelGlobal.lastChance,
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
    return gameBoardId;
}



async function saveGame(userToken, db, data) {
    const userId = await db.collection('users').findOne({ token: userToken});
    const gameDb = await db.collection('games').findOne({ _id: new ObjectId(data.gameId), creator_id: userId.username});
    const gameBoardId = await db.collection('gameboards').findOne({ gameId: gameDb._id });

    // Sauvegarder l'état du jeu avec l'ID de l'utilisateur
    await db.collection('savedGames').insertOne({
        userId,
        gameId:gameDb._id, // Assurez-vous que gameState est un objet sérialisable
        gameBoardId: gameBoardId._id,
        createdAt: new Date()
    });
    return gameBoardId;
}

async function loadGameFromDb(db, savedGame) {
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
        winner : gameBoardSaved.winner,
        lastChance: gameBoardSaved.lastChance
    };
    return config;
}

async function updatePositionCharacter(dataParse,db,gameModelGlobal,squareGameModel){
    const gameIdDb = await db.collection('games').findOne({ _id: new ObjectId(dataParse.gameId) });
    const gameBoard = await db.collection('gameboards').findOne({ gameId: gameIdDb._id });
    const currentPlayer = gameBoard.currentPlayer;
    let playerCharacter = await db.collection('character').findOne({ gameBoardId: gameBoard._id, currentPlayerIndex: currentPlayer });

    //find square where is the player

    //on met à jour la position du joueur dans la bd
    for (let square of squareGameModel) {
        if(parseInt(square.position.row) === parseInt(playerCharacter.position.row) && parseInt(square.position.col) === parseInt(playerCharacter.position.col)){
            //update db
            await db.collection('character').updateOne({ _id: playerCharacter._id , gameBoardId: gameBoard._id}, { $set: { position: { row: dataParse.row, col: dataParse.col } } });
            let playerCharacterUpdated = await db.collection('character').findOne({ _id: new ObjectId(playerCharacter._id)});
            console.log('Player position updated', playerCharacterUpdated.position.row + " " + playerCharacterUpdated.position.col);
        }
    }
    return gameBoard;
}
async function  manageBotMove(squareGameModel,gameBoard,gameModelGlobal,actionController,db){
    let botCharacter = await db.collection('character').findOne({ gameBoardId: new ObjectId(gameBoard._id), currentPlayerIndex: gameModelGlobal.currentPlayer });
    let botCharacterGameModel = gameModelGlobal.player_array.getPlayer(gameModelGlobal.currentPlayer);

    playBot(gameModelGlobal, actionController);


    for(let square of squareGameModel){
        if(parseInt(square.position.row) === parseInt(botCharacter.position.row) && parseInt(square.position.col) === parseInt(botCharacter.position.col)){

            //update db
            await db.collection('character').updateOne({ _id: botCharacter._id , gameBoardId: gameBoard._id}, { $set: { position: { row: botCharacterGameModel.position.row, col: botCharacterGameModel.position.col } } });
            let botCharacterUpdated = await db.collection('character').findOne({ _id: new ObjectId(botCharacter._id)});
            console.log('Bot position updated', botCharacterUpdated.position.row + " " + botCharacterUpdated.position.col);
        }
    }
}

async function updateCurrentPlayerFromDb(gameBoard,db,gameModelGlobal){
    //on met à jour le joueur actuel dans la bd
    await db.collection('gameboards').updateOne({ _id: gameBoard._id }, { $set: { currentPlayer: gameModelGlobal.currentPlayer, lastChance: gameModelGlobal.lastChance, winner: gameModelGlobal.winner } });
    const gameBoardUpdated = await db.collection('gameboards').findOne({ _id: gameBoard._id });
    console.log('Current player db  updated', gameBoardUpdated.currentPlayer);
}

async function updateWallsAndVisibilityFromBd(wallDataDeserialized,playerBd,gameBoardIdDb,gameModelGlobal,db,squareGameModel){
    let nbWalls = playerBd.nbWalls - 1;
    await db.collection('character').updateOne({ _id: new ObjectId(playerBd._id) }, { $set: { nbWalls : nbWalls } });
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

        //met à jour la visibilité des cases
        if (wall) {
            let wallToCopy = null;
            //CHERCHER LES VALEURS A UPDATE
            if(type === 'H'){
                for(let j=0;j<gameModelGlobal.horizontal_Walls.wallList.length;j++){
                    let wall = gameModelGlobal.horizontal_Walls.wallList[j];
                    if(wall.position.row === row && wall.position.col === col){
                        wallToCopy = wall;break;
                    }
                }
            }
            else if(type === 'V'){
                for(let j=0;j<gameModelGlobal.vertical_Walls.wallList.length;j++){
                    let wall = gameModelGlobal.vertical_Walls.wallList[j];
                    if(wall.position.row === row && wall.position.col === col){
                        wallToCopy = wall;break;
                    }
                }
            }

            // Met à jour la visibilité du mur dans la base de données
            await db.collection('walls').updateOne({_id: new ObjectId(wall._id)}, {$set: {isPresent: wallToCopy.isPresent, visibility: wallToCopy.visibility, idPlayer: wallToCopy.idPlayer, wallGroup: wallToCopy.wallGroup}});
            const wallUpdated = await db.collection('walls').findOne({_id: new ObjectId(wall._id)});

            for (let square of squareGameModel) {
                //update db
                await db.collection('squares').updateOne({ gameBoardId: gameBoardIdDb._id, "position.row": square.position.row, "position.col": square.position.col }, { $set: { isVisible: false , visibility: wall.visibility} });
            }
        }
        else {
            console.log("Wall not found or already present");
        }
    }
}

module.exports = { createGameDb, saveGame, loadGameFromDb,updatePositionCharacter,manageBotMove,updateCurrentPlayerFromDb,updateWallsAndVisibilityFromBd };