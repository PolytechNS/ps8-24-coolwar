// Importer les modules nécessaires
const { computeVisibilityPlayableSquare, getWallOpponent } = require('./modelParser.js');
const { GameModel } = require('../Model/Game/GameModel.js');
const gameState = require('./dataVella.js');

// Initialiser un GameModel
let gameModel = new GameModel();

// Appeler convertBoard avec playableSquares du gameModel en paramètre
let result = computeVisibilityPlayableSquare(gameModel.playable_squares);


let resultWallOppo = getWallOpponent(gameModel);

console.log("result opponent");
console.log(resultWallOppo);