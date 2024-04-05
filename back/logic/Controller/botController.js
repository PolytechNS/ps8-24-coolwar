const { computeMove } = require('../AI/ai.js');
const { gameModel } = require('../Model/Game/GameModel.js');
const {nextMove,setup} = require('../AI/CoolWarAI.js');
const {computeVisibilityPlayableSquare,getWallOpponent,getOwnWalls} = require('../AI/modelParser.js');


//IA DEBILE
exports.playBot = function (gameModel, actionController) {
    let currentPlayerGameModel = gameModel.currentPlayer;
    actionController.moveCharacterAI(currentPlayerGameModel, 3);
}


//IA INTELLIGENTE

exports.setupBotController = function (currentPlayerIndex) {
    // Retourne la promesse pour la chaîne d'appels
    return new Promise((resolve, reject) => {
        // Appelle la fonction setup originale et augmente l'index de joueur
        setup(currentPlayerIndex).then((position) => {
            // Résout la promesse avec la position obtenue
            resolve(position);
        }).catch((error) => {
            // Rejette la promesse en cas d'erreur
            reject(error);
        });
    });
};


exports.nextMoveBotController = function (gameModel) {
    let gameState = convertGameModelToGameState(gameModel.playable_squares, gameModel.horizontal_Walls.wallList, gameModel.vertical_Walls.wallList, 2, gameModel.player_array);
    let board = computeVisibilityPlayableSquare(gameModel, gameModel.currentPlayer);
    let opponentWalls = getWallOpponent(gameModel);
    let ownWalls = getOwnWalls(gameModel);
    return new Promise((resolve, reject) => {
        nextMove(gameState).then((move) => {
            resolve(move);
        }).catch((error) => {
            reject(error);
        });
    });
}

function convertOurCoordinatesToVellaCooordinates(row,col){
    return [parseInt(col)+1,9-parseInt(row)];
}

function convertGameModelToGameState(playableSquares, horizontalWalls, verticalWalls, playOrder, players) {
    let gameState = {
        board: Array(9).fill().map(() => Array(9).fill(0)), // Initialiser le plateau de jeu
        ownWalls: [],
        opponentWalls: []
    };

    if(playableSquares.getPlayableSquare(players.players[0].position.row,players.players[0].position.col).visibility >= 0 ){
        gameState.board[players.players[0].position.row][players.players[0].position.col] = 2;
        console.log("on voit le mec youpi");
    }

    if(players.players[1].position !== null){
        gameState.board[players.players[1].position.row][players.players[1].position.col] = 1;
        console.log("our position on the board converted", players.players[1].position.row,players.players[1].position.col);
    }

    // Fonction d'aide pour traiter les murs et les ajouter à gameState
    function addWallsToGameState(walls, isHorizontal) {
        walls.forEach((wall) => {
            if (wall.isPresent) {
                let position = convertOurCoordinatesToVellaCooordinates(wall.position.row, wall.position.col);
                let wallRepresentation = position.toString(); // La méthode toString de Position retourne row + col
                let wallType = isHorizontal ? "0" : "1"; // 0 pour horizontal, 1 pour vertical
                let ownerArray = wall.idPlayer === playOrder ? gameState.ownWalls : gameState.opponentWalls;
                ownerArray.push([wallRepresentation, wallType]);
            }
        });
    }

    addWallsToGameState(horizontalWalls, true); // Pour les murs horizontaux
    addWallsToGameState(verticalWalls, false); // Pour les murs verticaux

    return gameState;
}
