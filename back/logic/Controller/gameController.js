const {ObjectId} = require("mongodb");

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

module.exports = { createGameDb, saveGame, loadGameFromDb };