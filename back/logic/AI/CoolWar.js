// CoolWar.js


/*
gameState : {
--------------------------------------------
opponentWalls : une liste contenant chaque mur de l'adversaire
ownWalls : une liste contenant chaque mur de l'IA
board : une liste contenant 9 listes de longueur 9,
pour laquelle board[i][j] représenter le contenu de la cellule (i+1, j+1)
--------------------------------------------
}

move : {
--------------------------------------------
action : "move" / "wall" / "idle"
value:
    "move" : une chaîne de caractères représentant la position
    "wall" : une liste contenant 2 éléments :
            - une chaîne de caractères représentant le carré en haut à gauche avec lequel le mur est en contact
            - un entier :  0 si le mur est placé horizontalement, 1 s'il est vertical

 */


// setup function
/*
    AIplay : un entier qui vaut 1 si l'IA joue en premier, 2 si l'IA joue en deuxième
    return : une promesse en chaîne de caractères représentant la position de la forme "34" 3 lignes et 4 colonnes
    de l'ia sur le plateau de jeu
 */
exports.setup = function(AIplay) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Assuming the AI always starts at the middle of the board
            let position = AIplay === 1 ? "44" : "55";
            resolve(position);
        }, 1000);
    });
}
// nextMove function

/*
    gameState : un objet représentant l'état du jeu
    return : une promesse qui est un objet représentant le prochain mouvement de l'IA

 */
exports.nextMove = function(gameState) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Get the current position, finish line, own walls and opponent walls from the gameState
            let currentPosition = gameState.currentPosition; // replace with your logic
            let finishLine = gameState.finishLine; // replace with your logic
            let ownWalls = gameState.ownWalls; // replace with your logic
            let opponentWalls = gameState.opponentWalls; // replace with your logic

            // Calculate the heuristic scores
            let distanceScore = manhattanDistance(currentPosition, finishLine);
            let wallScore = wallHeuristic(ownWalls, opponentWalls);

            // Use the heuristic scores to determine the next move
            let move = { action: "move", value: "00" }; // replace with your logic based on the heuristic scores
            resolve(move);
        }, 200);
    });
}

// correction function
/*
    rightMove : le mouvement correct que l'IA aurait du faire si elle avait tenté de faire un mouvement impossible
    return : une promesse qui se résout en un booléen indiquant si l'IA est prête à continuer

 */
exports.correction = function(rightMove) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Assuming the AI is always ready to continue
            resolve(true);
        }, 50);
    });
}

// updateBoard function
/*
    gameState : un objet représentant l'état du jeu
    return : une promesse qui se résout en un booléen

 */
exports.updateBoard = function(gameState) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Assuming the AI always accepts the new game state
            resolve(true);
        }, 50);
    });
}


// Heuristique de Distance
function manhattanDistance(currentPosition, finishLine) {
    let [currentX, currentY] = currentPosition;
    let finishY = finishLine === 'top' ? 0 : 8; // Assuming the board is 9x9
    return Math.abs(currentX - finishY) + Math.abs(currentY - finishY);
}

// Heuristique de Mur
function wallHeuristic(ownWalls, opponentWalls) {
    // The more walls the AI has, the better
    let ownWallScore = ownWalls.length;

    // The more walls the opponent has, the worse
    let opponentWallScore = opponentWalls.length;

    // The heuristic is the difference between the AI's walls and the opponent's walls
    return ownWallScore - opponentWallScore;
}