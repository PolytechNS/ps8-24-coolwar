const { computeMove } = require('../AI/ai.js');
const { gameModel } = require('../Model/Game/GameModel.js');

exports.playBot = function (gameModel, actionController) {
    let currentPlayerGameModel = gameModel.currentPlayer;
    console.log("currentPlayerGameModel : ", currentPlayerGameModel);
    actionController.moveCharacterAI(currentPlayerGameModel, 3);
}