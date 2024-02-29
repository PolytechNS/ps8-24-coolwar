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

module.exports = { createGameDb };