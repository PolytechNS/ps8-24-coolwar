const { computeMove } = require('../AI/ai.js');
const { gameModel } = require('../Model/Game/GameModel.js');
const {nextMove,setup} = require('../AI/CoolWar.js');
const {computeVisibilityPlayableSquare,getWallOpponent,getOwnWalls} = require('../AI/modelParser.js');


//IA DEBILE
exports.playBot = function (gameModel, actionController) {
    let currentPlayerGameModel = gameModel.currentPlayer;
    console.log("currentPlayerGameModel : ", currentPlayerGameModel);
    actionController.moveCharacterAI(currentPlayerGameModel, 3);
}


//IA INTELLIGENTE

exports.setupBothController = function (currentPlayerIndex) {
    // Retourne la promesse pour la chaîne d'appels
    return new Promise((resolve, reject) => {
        // Appelle la fonction setup originale et augmente l'index de joueur
        setup(currentPlayerIndex).then((position) => {
            console.log("CURRENT BOT INDEX ", currentPlayerIndex);
            console.log("SETUP: ", position);
            // Résout la promesse avec la position obtenue
            resolve(position);
        }).catch((error) => {
            // Rejette la promesse en cas d'erreur
            reject(error);
        });
    });
};


exports.nextMove = function (gameModel) {
    let board = computeVisibilityPlayableSquare(gameModel, gameModel.currentPlayer);
    let opponentWalls = getWallOpponent(gameModel);
    let ownWalls = getOwnWalls(gameModel);
    console.log("NEXT MOVE OBJETS INITIALIZED");
    let start = Date.now();
    nextMove({board, opponentWalls, ownWalls}).then((move) => {
        console.log("NEXT MOVE: ",move);
        let timeTaken = Date.now() - start;
        console.log("Total time taken : " + timeTaken + " milliseconds");
    });
}