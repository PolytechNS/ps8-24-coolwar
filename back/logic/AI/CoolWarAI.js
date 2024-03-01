// CoolWarAI.js

const { Graph } = require('../Model/Graph/Graph.js');
const { Position } = require('../Model/Objects/Position.js');
const { WallDictionary } = require('../Model/Objects/WallDictionary.js');
const { PlayableSquareDictionary } = require('../Model/Objects/PlayableSquareDictionary.js');
const { Djikstra } = require('../Model/Graph/Djikstra.js');


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


// ------------------- VARIABLES ----------------------------------

let finishLine = null; // trouver la ligne d'arrivée
let playOrder = null;
let graph = null; // le graph de jeu
let lastMove = null; // le dernier mouvement de l'IA

let moveCount = 0; // le nombre de mouvements effectués par l'IA
let wallCount = 0; // le nombre de murs placés par l'IA

// setup function
/*
    AIplay : un entier qui vaut 1 si l'IA joue en premier, 2 si l'IA joue en deuxième
    return : une promesse en chaîne de caractères représentant la position de la forme "34" 3 lignes et 4 colonnes
    de l'ia sur le plateau de jeu
 */
function setup(AIplay) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            playOrder = AIplay;
           const res = setupIA(AIplay);
           if(res!==null){resolve(res);}
           else{reject("Internal Error From IA Setup");}
        }, 950);
    });

    function setupIA(AIplay){
        let randomBottom = Math.round(Math.random() * 8) + 1;
        let randomTop = Math.round(Math.random() * 8) + 1;
        let position = null;
        if(AIplay === 1){
            position = randomBottom.toString()+"9";
            finishLine = parseInt("1");
        }
        else{
            position = randomTop.toString()+"1";
            finishLine = parseInt("9");
        }
        return position;
    }
}

// Real_nextMove function
/*
    gameState : un objet représentant l'état du jeu
    return : une promesse qui est un objet représentant le prochain mouvement de l'IA
 */

function nextMove(gameState) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const res = Real_nextMove(gameState);
            if(res!==null){resolve(res);}
            else{reject("Internal Error From IA NEXT MOVE");}
        }, 1000);
    });
}



function Real_nextMove(gameState) {
    console.log("REAL NEXT MOVE");
    console.log("GAME STATE : ",gameState);
    let opponentPos = opponentPosition(gameState.board);
    let opponentPosConverted = null;
    console.log("OPPONENT POS   : ",opponentPos);
    if(opponentPos !== null) {opponentPosConverted = convertOurCoordinatesToVellaCooordinates(opponentPos[1], opponentPos[0]);}

    //SI LES DERNIERES ACTIONS ETAIENT DES MURS EN PLUS
    if(wallCount > 2){
        wallCount = 0;
        lastMove = "move";
        moveCount++;
        return moveCharacterWithDjikstra();
    }

    //SI ON CONNAIT LA POSITION DU JOUEUR ADVERSE -> ON MET UN MUR DEVANT LUI
    if(opponentPosConverted!==null){
        //si ma finishLine = 1 --> ma direction = haut // ennemi = bas ||
        if(finishLine !== 1){
            //je verifie que le mur qu'on veut poser n'est pas dans les murs deja existants
            let wall = isWallAtPosition(gameState, opponentPosConverted);
            //SI LE MUR EST BIEN TROUVE
            if(wall!==null){
                //SI LE MUR EST HORIZONTAL
                if(wall[1] === 0){
                    //ON REGARDE S'IL EXISTE UN MUR A GAUCHE
                    let leftHorizontalWallPosition = [opponentPosConverted[0] - 2, opponentPosConverted[1]];
                    let leftVerticalWallPosition = [opponentPosConverted[0]-1, opponentPosConverted[1]+1];
                    let isLeftHorizontalWallExist = isWallAtPosition(gameState, leftHorizontalWallPosition);
                    let isLeftVerticalWallExist = isWallAtPosition(gameState, leftVerticalWallPosition)
                    //S'IL N'EXISTE PAS, ON POSE ABSOLUMENT UN MUR A GAUCHE (BLOQUAGE >>)
                    if (!isLeftHorizontalWallExist && !isLeftVerticalWallExist){
                        let djikstraLeftHorizontalResult = computeDjikstraForSpecificWall(gameState,wall,'H','G');
                        let djikstraLeftVerticalResult = computeDjikstraForSpecificWall(gameState,wall,'V','G');
                        //On compare les deux valeurs et on prend la plus grande valeur des deux
                        if(djikstraLeftHorizontalResult > djikstraLeftVerticalResult){
                            lastMove = "wall";
                            wallCount++;
                            return {action: "wall",
                                value: [leftHorizontalWallPosition[0].toString()+leftHorizontalWallPosition[1].toString(), 0]};
                        }
                        else{
                            lastMove = "wall";
                            wallCount++;
                            return {action: "wall",
                                value: [leftVerticalWallPosition[0].toString()+leftVerticalWallPosition[1].toString(), 1]};
                        }
                    }
                    //ON REGARDE S'IL EXISTE UN MUR A DROITE
                    else{
                        let rightHorizontalWallPosition = [opponentPos[0] + 2, opponentPos[1]];
                        let rightVerticalWallPosition = [opponentPos[0] +1 , opponentPos[1]+1];
                        let isRightHorizontalWallExist = isWallAtPosition(gameState, rightHorizontalWallPosition);
                        let isRightVerticalWallExist = isWallAtPosition(gameState, rightVerticalWallPosition);

                        if(!isRightHorizontalWallExist && !isRightVerticalWallExist){
                            let djikstraRightHorizontalResult = computeDjikstraForSpecificWall(gameState,wall,'H','R');
                            let djikstraRightVerticalResult = computeDjikstraForSpecificWall(gameState,wall,'V','R');
                            //On compare les deux valeurs et on prend la plus grande valeur des deux
                            if(djikstraRightHorizontalResult > djikstraRightVerticalResult){
                                lastMove = "wall";
                                wallCount++;
                                return {action: "wall",
                                    value: [rightHorizontalWallPosition[0].toString()+rightHorizontalWallPosition[1].toString(), 0]};
                            }
                            else{
                                lastMove = "wall";
                                wallCount++;
                                return {action: "wall",
                                    value: [rightVerticalWallPosition[0].toString()+rightVerticalWallPosition[1].toString(), 1]};
                            }
                        }
                        else{
                            lastMove = "move";
                            moveCount++;
                            return moveCharacterWithDjikstra();
                        }
                    }
                }
                //SI LE MUR EST VERTICAL
                else if(wall[1] === 1){
                    //ON REGARDE S'IL EXISTE UN MUR A GAUCHE
                    let leftHorizontalWallPosition = [opponentPosConverted[0] -1, opponentPosConverted[1]];
                    let isLeftHorizontalWallExist = isWallAtPosition(gameState, leftHorizontalWallPosition);
                    //S'IL N'EXISTE PAS, ON POSE ABSOLUMENT UN MUR A GAUCHE (BLOQUAGE >>)
                    if (!isLeftHorizontalWallExist){
                        lastMove = "wall";
                        wallCount++;
                            return {action: "wall",
                                value: [leftHorizontalWallPosition[0].toString()+leftHorizontalWallPosition[1].toString(), 0]};
                    }
                    //ON REGARDE S'IL EXISTE UN MUR A DROITE
                    else{
                        lastMove = "move";
                        moveCount++;
                        return moveCharacterWithDjikstra();
                    }
                }
            }
            //SI LE MUR EXISTE, JE REGARDE LES MURS VOISINS
            else {
                lastMove = "move";
                moveCount++;
                return moveCharacterWithDjikstra();
            }
        }
        else{
            //je verifie que le mur qu'on veut poser n'est pas dans les murs deja existants
            opponentPosConverted = [parseInt(opponentPosConverted[0]),parseInt(opponentPosConverted[1]+1)];
            let wall = isWallAtPosition(gameState, opponentPosConverted);
            //SI LE MUR EST BIEN TROUVE
            if(wall!==null){
                //SI LE MUR EST HORIZONTAL
                if(wall[1] === 0){
                    //ON REGARDE S'IL EXISTE UN MUR A GAUCHE
                    let leftHorizontalWallPosition = [opponentPosConverted[0] - 2, opponentPosConverted[1]];
                    let leftVerticalWallPosition = [opponentPosConverted[0]-1, opponentPosConverted[1]-1];
                    let isLeftHorizontalWallExist = isWallAtPosition(gameState, leftHorizontalWallPosition);
                    let isLeftVerticalWallExist = isWallAtPosition(gameState, leftVerticalWallPosition)
                    //S'IL N'EXISTE PAS, ON POSE ABSOLUMENT UN MUR A GAUCHE (BLOQUAGE >>)
                    if (!isLeftHorizontalWallExist && !isLeftVerticalWallExist){
                        let djikstraLeftHorizontalResult = computeDjikstraForSpecificWall(gameState,wall,'H','G');
                        let djikstraLeftVerticalResult = computeDjikstraForSpecificWall(gameState,wall,'V','G');
                        //On compare les deux valeurs et on prend la plus grande valeur des deux
                        if(djikstraLeftHorizontalResult > djikstraLeftVerticalResult){
                            lastMove = "wall";
                            wallCount++;
                            return {action: "wall",
                                value: [leftHorizontalWallPosition[0].toString()+leftHorizontalWallPosition[1].toString(), 0]};
                        }
                        else{
                            lastMove = "wall";
                            wallCount++;
                            return {action: "wall",
                                value: [leftVerticalWallPosition[0].toString()+leftVerticalWallPosition[1].toString(), 1]};
                        }
                    }
                    //ON REGARDE S'IL EXISTE UN MUR A DROITE
                    else{
                        let rightHorizontalWallPosition = [opponentPosConverted[0] + 2, opponentPosConverted[1]];
                        let rightVerticalWallPosition = [opponentPosConverted[0] +1 , opponentPosConverted[1]-1];
                        let isRightHorizontalWallExist = isWallAtPosition(gameState, rightHorizontalWallPosition);
                        let isRightVerticalWallExist = isWallAtPosition(gameState, rightVerticalWallPosition);

                        if(!isRightHorizontalWallExist && !isRightVerticalWallExist){
                            let djikstraRightHorizontalResult = computeDjikstraForSpecificWall(gameState,wall,'H','R');
                            let djikstraRightVerticalResult = computeDjikstraForSpecificWall(gameState,wall,'V','R');
                            //On compare les deux valeurs et on prend la plus grande valeur des deux
                            if(djikstraRightHorizontalResult > djikstraRightVerticalResult){
                                lastMove = "wall";
                                wallCount++;
                                return {action: "wall",
                                    value: [rightHorizontalWallPosition[0].toString()+rightHorizontalWallPosition[1].toString(), 0]};
                            }
                            else{
                                lastMove = "wall";
                                wallCount++;
                                return {action: "wall",
                                    value: [rightVerticalWallPosition[0].toString()+rightVerticalWallPosition[1].toString(), 1]};
                            }
                        }
                        else{
                            lastMove = "move";
                            moveCount++;
                            return moveCharacterWithDjikstra();
                        }
                    }
                }
                //SI LE MUR EST VERTICAL
                else if(wall[1] === 1){
                    //ON REGARDE S'IL EXISTE UN MUR A GAUCHE
                    let leftHorizontalWallPosition = [opponentPosConverted[0] -1, opponentPosConverted[1]];
                    let isLeftHorizontalWallExist = isWallAtPosition(gameState, leftHorizontalWallPosition);
                    //S'IL N'EXISTE PAS, ON POSE ABSOLUMENT UN MUR A GAUCHE (BLOQUAGE >>)
                    if (!isLeftHorizontalWallExist){
                        lastMove = "wall";
                        wallCount++;
                        return {action: "wall",
                            value: [leftHorizontalWallPosition[0].toString()+leftHorizontalWallPosition[1].toString(), 0]};
                    }
                    //ON REGARDE S'IL EXISTE UN MUR A DROITE
                    else{
                        lastMove = "move";
                        moveCount++;
                        return moveCharacterWithDjikstra();
                    }
                }
            }
            //SI LE MUR EXISTE, JE REGARDE LES MURS VOISINS
            else {
                lastMove = "move";
                moveCount++;
                return moveCharacterWithDjikstra();
            }
        }
    }
    //ON BOUGE NOTRE PERSONNAGE
    else{
        lastMove = "move";
        moveCount++;
        return moveCharacterWithDjikstra();
    }



    // --------------------- INTERNAL FUNCTIONS ---------------------------------- //
    
    function moveCharacterWithDjikstra(){
        const [playableSquares, horizontalWalls, verticalWalls] = convertGameStateToGamemodel(gameState);
        let graph = new Graph(playableSquares, horizontalWalls, verticalWalls);
        const ownPosition = myPosition(gameState.board);
        const ownNode = graph.getNodeFromCoordinates(ownPosition[0], ownPosition[1]);
        let bestRes = null;

        //COMPUTE POUR TOUTE LA LIGNE
        for (let i = 0; i < 8; i++) {
            console.log("moveCharacterWithDjikstra");
            let res = Djikstra.prototype.compute_djikstra(graph, ownNode, graph.getNodeFromCoordinates(finishLine-1, i));
            if (bestRes === null) {bestRes = res;} else if (res.distance < bestRes.distance) {bestRes = res;}
        }
        let nextMove = bestRes.path[1].position;
        let finalPosition = convertOurCoordinatesToVellaCooordinates(nextMove.row,nextMove.col);
        //console.log("FINAL POSITION : ",finalPosition);
        return { action: " move", value: finalPosition[0].toString() + finalPosition[1].toString() };
    }
    function isWallAlreadyExists(wallList, opponentPos){
        let isExists = null;
        wallList.forEach(function (wall) {
            let wallPosition = new Position(wall[0].split("")[0],wall[0].split("")[1]);
            //si il y a deja un mur devant la personne
            if(parseInt(wallPosition.row) === parseInt(opponentPos[0]) && parseInt(wallPosition.col) === parseInt(opponentPos[1]) ){
                isExists=wall;
            }
        });
        return isExists;
    }
    function isWallAtPosition(gameState,position){
        let wallExists = isWallAlreadyExists(gameState.opponentWalls, position);
        if(wallExists === null){wallExists = isWallAlreadyExists(gameState.ownWalls, position);}

        return wallExists;
    }
    function computeDjikstaFor(gameState,player){
        if(player==="me"){
            const [playableSquares, horizontalWalls, verticalWalls] = convertGameStateToGamemodel(gameState);
            let graph = new Graph(playableSquares, horizontalWalls, verticalWalls);
            const ownPosition = myPosition(gameState.board);
            const ownNode = graph.getNodeFromCoordinates(ownPosition[0], ownPosition[1]);
            let bestRes = null;
            //COMPUTE POUR TOUTE LA LIGNE
            for (let i = 0; i < 8; i++) {
                let res = Djikstra.prototype.compute_djikstra(graph, ownNode, graph.getNodeFromCoordinates(finishLine-1, i));
                if (bestRes === null) {bestRes = res;} else if (res.distance < bestRes.distance) {bestRes = res;}
            }
            return bestRes;
        }
        else if(player==="opponent"){
            const [playableSquares, horizontalWalls, verticalWalls] = convertGameStateToGamemodel(gameState);
            let graph = new Graph(playableSquares, horizontalWalls, verticalWalls);
            const oppPos = opponentPosition(gameState.board);
            const oppNode = graph.getNodeFromCoordinates(oppPos[0], oppPos[1]);
            let bestRes = null;
            //COMPUTE POUR TOUTE LA LIGNE
            for (let i = 0; i < 8; i++) {
                let res = Djikstra.prototype.compute_djikstra(graph, oppNode, graph.getNodeFromCoordinates(invertFinishLine()-1, i));
                if (bestRes === null) {bestRes = res;} else if (res.distance < bestRes.distance) {bestRes = res;}
            }
            return bestRes;
        }

    }
    function invertFinishLine(){
        if(finishLine === 1){return 9;}
        else if(finishLine === 9){return 1;}
    }

    //DIRECTION --> G/D
    //TYPE --> H/V
    function computeDjikstraForSpecificWall(gameState,rootWall,typeWallToAnalysis,directionToAnalysis){
        //SI LE MUR EST HORIZONTAL
        if(rootWall[1]===0){
            if(typeWallToAnalysis === 'H' && directionToAnalysis === 'G'){
                let hypoteticCase = JSON.parse(JSON.stringify(gameState));
                //on place le mur horizontal dans le gameState Copie
                hypoteticCase.ownWalls.push([(rootWall[0]-2).toString()+rootWall[1].toString(), 0]);
                //ON REGARDE LA DISTANCE AVEC DIJKSTRA
                return computeDjikstaFor(hypoteticCase,"opponent");
            }
            if(typeWallToAnalysis === 'H' && directionToAnalysis === 'D'){
                let hypoteticCase = JSON.parse(JSON.stringify(gameState));
                //on place le mur horizontal dans le gameState Copie
                hypoteticCase.ownWalls.push([(rootWall[0]+2).toString()+rootWall[1].toString(), 0]);
                //ON REGARDE LA DISTANCE AVEC DIJKSTRA
                return computeDjikstaFor(hypoteticCase,"opponent");
            }
            if(typeWallToAnalysis === 'V' && directionToAnalysis === 'G'){
                let hypoteticCase = JSON.parse(JSON.stringify(gameState));
                //on place le mur horizontal dans le gameState Copie
                hypoteticCase.ownWalls.push([(rootWall[0]-1).toString()+(rootWall[1]+1).toString(), 1]);
                //ON REGARDE LA DISTANCE AVEC DIJKSTRA
                return computeDjikstaFor(hypoteticCase,"opponent");
            }
            if(typeWallToAnalysis === 'V' && directionToAnalysis === 'D'){
                let hypoteticCase = JSON.parse(JSON.stringify(gameState));
                //on place le mur horizontal dans le gameState Copie
                hypoteticCase.ownWalls.push([(rootWall[0]+1).toString()+(rootWall[1]+1).toString(), 1]);
                //ON REGARDE LA DISTANCE AVEC DIJKSTRA
                return computeDjikstaFor(hypoteticCase,"opponent");
            }
        }
        //SI LE MUR EST VERTICAL
        if(rootWall[1] === 1){
            if(typeWallToAnalysis === 'H' && directionToAnalysis === 'G'){
                let hypoteticCase = JSON.parse(JSON.stringify(gameState));
                //on place le mur horizontal dans le gameState Copie
                hypoteticCase.ownWalls.push([(rootWall[0]-1).toString()+(rootWall[1]-1).toString(), 0]);
                //ON REGARDE LA DISTANCE AVEC DIJKSTRA
                return computeDjikstaFor(hypoteticCase,"opponent");
            }
            if(typeWallToAnalysis === 'H' && directionToAnalysis === 'D'){
                let hypoteticCase = JSON.parse(JSON.stringify(gameState));
                //on place le mur horizontal dans le gameState Copie
                hypoteticCase.ownWalls.push([(rootWall[0]+1).toString()+(rootWall[1]-1).toString(), 0]);
                //ON REGARDE LA DISTANCE AVEC DIJKSTRA
                return computeDjikstaFor(hypoteticCase,"opponent");
            }
        }
    }
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
            const res = true;
            if(res!==false){resolve(res);}
            else{reject("Internal Error From IA Setup");}
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

function myPosition(board){
    for (let i = 0; i < board.length; i++) {
        const innerList = board[i];
        for (let j = 0; j < innerList.length; j++) {
            if (board[i][j] === 1){
                return [i, j];
            }
        }
    }
}

//RETOURNE -> [col,row]
function opponentPosition(board){
    for (let i = 0; i < board.length; i++) {
        const innerList = board[i];
        for (let j = 0; j < innerList.length; j++) {
            if (board[i][j] === 2){
                return [i, j];
            }
        }
    }
    return null;
}

function convertVellaCooordinatesToOurs(col,row){
    return [9-parseInt(row),parseInt(col)-1];
}
function convertOurCoordinatesToVellaCooordinates(row,col){
    return [parseInt(col)+1,9-parseInt(row)];
}

function convertGameStateToGamemodel(gameState){
    let horizontalWalls = new WallDictionary();
    let verticalWalls = new WallDictionary();
    let playableSquares = new PlayableSquareDictionary();
    for (let i = 0; i < 9; i++) {for (let j = 0; j < 9; j++) {
        horizontalWalls.addWall(i, j,'H',false,null,null);
        verticalWalls.addWall(i, j,'V',false,null,null);}}

    let opponentPlayOrder = playOrder === 1 ? 2 : 1;
    gameState.opponentWalls.forEach(function (wall){
        let wallPosition = new Position(wall[0].split("")[0],wall[0].split("")[1]);
        //SI MUR HORIZONTAL
        if(parseInt(wall[1])===parseInt("0")){
            let goodCoordinates = convertVellaCooordinatesToOurs(wallPosition.row,wallPosition.col);
            let wallToEdit = horizontalWalls.getWall(goodCoordinates[0],goodCoordinates[1],'H');
            console.log("WALL TO EDIT : ",wallToEdit);
            let neighborOfWallToEdit = horizontalWalls.getWall(goodCoordinates[0],goodCoordinates[1]+1, 'H');
            wallToEdit.setPresent();
            wallToEdit.setOwner(opponentPlayOrder);
            neighborOfWallToEdit.setPresent();
            neighborOfWallToEdit.setOwner(opponentPlayOrder);
        }
        //SI MUR VERTICAL
        else if(parseInt(wall[1])===parseInt("1")){
            let goodCoordinates = convertVellaCooordinatesToOurs(wallPosition.row,wallPosition.col);
            let wallToEdit = verticalWalls.getWall(goodCoordinates[0],goodCoordinates[1],'V');
            console.log("WALL TO EDIT : ",wallToEdit);

            let neighborOfWallToEdit = verticalWalls.getWall(goodCoordinates[0]-1,goodCoordinates[1], 'V');
            wallToEdit.setPresent();
            wallToEdit.setOwner(opponentPlayOrder);
            neighborOfWallToEdit.setPresent();
            neighborOfWallToEdit.setOwner(opponentPlayOrder);
        }
    });
    gameState.ownWalls.forEach(function (wall){
        console.log("WALL : ",wall);
        let wallPosition = new Position(wall[0].split("")[0],wall[0].split("")[1]);
        if(parseInt(wall[1])===parseInt("0")) {
            let goodCoordinates = convertVellaCooordinatesToOurs(wallPosition.row, wallPosition.col);
            let wallToEdit = horizontalWalls.getWall(goodCoordinates[0], goodCoordinates[1], 'H');
            console.log("WALL TO EDIT : ",wallToEdit);

            let neighborOfWallToEdit = horizontalWalls.getWall(goodCoordinates[0],goodCoordinates[1]+1, 'H');
            wallToEdit.setPresent();
            wallToEdit.setOwner(playOrder);
            neighborOfWallToEdit.setPresent();
            neighborOfWallToEdit.setOwner(playOrder);
        }
        else if(parseInt(wall[1])===parseInt("1")){
            let goodCoordinates = convertVellaCooordinatesToOurs(wallPosition.row,wallPosition.col);
            let wallToEdit = verticalWalls.getWall(goodCoordinates[0],goodCoordinates[1],'V');
            console.log("WALL TO EDIT : ",wallToEdit);

            let neighborOfWallToEdit = verticalWalls.getWall(goodCoordinates[0]-1,goodCoordinates[1], 'V');
            wallToEdit.setPresent();
            wallToEdit.setOwner(playOrder);
            neighborOfWallToEdit.setPresent();
            neighborOfWallToEdit.setOwner(playOrder);
        }
    });

    //INIT DES PLAYABLE SQUARES
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            let gameBoardCase = gameState.board[j][i];
            let goodCoordinates = convertVellaCooordinatesToOurs(j+1, i+1);
            //SI ON EST SUR LA CASE
            if(gameBoardCase === 1) {
                if(i<4) {playableSquares.addPlayableSquare(goodCoordinates[0], goodCoordinates[1], playOrder, false, parseInt("-1"));}
                else if(i===4){playableSquares.addPlayableSquare(goodCoordinates[0], goodCoordinates[1], playOrder, false, parseInt("0"));}
                else if(i<=9){playableSquares.addPlayableSquare(goodCoordinates[0], goodCoordinates[1], playOrder, false, parseInt("1"));}
            }
            //SI L'ADVERSAIRE EST SUR LA CASE
            else if(gameBoardCase === 2) {
                if(i<4) {playableSquares.addPlayableSquare(goodCoordinates[0], goodCoordinates[1], opponentPlayOrder, false, parseInt("-1"));}
                else if(i===4){playableSquares.addPlayableSquare(goodCoordinates[0], goodCoordinates[1], opponentPlayOrder, false, parseInt("0"));}
                else if(i<=9){playableSquares.addPlayableSquare(goodCoordinates[0], goodCoordinates[1], opponentPlayOrder, false, parseInt("1"));}
            }
            //SI ON VOIT LA CASE
            else if(gameBoardCase===0){
                if(i<4) {playableSquares.addPlayableSquare(goodCoordinates[0], goodCoordinates[1], null, true, parseInt("-1"));}
                else if(i===4){playableSquares.addPlayableSquare(goodCoordinates[0], goodCoordinates[1], null, true, parseInt("0"));}
                else if(i<=9){playableSquares.addPlayableSquare(goodCoordinates[0], goodCoordinates[1], null, true, parseInt("1"));}
            }
            //SINON, PAR DEFAUT, ON NE VOIT PAS LA CASE
            else {
                if (i < 4) {
                    playableSquares.addPlayableSquare(i, j, null, false, parseInt("-1"));
                } else if (i === 4) {
                    playableSquares.addPlayableSquare(i, j, null, false, parseInt("0"));
                } else if (i <= 9) {
                    playableSquares.addPlayableSquare(i, j, null, false, parseInt("1"));
                }
            }
        }
    }
    //console.log(horizontalWalls.wallList.toString());
    //console.log(verticalWalls.wallList.toString());
    return [playableSquares,horizontalWalls,verticalWalls];
}

function main() {
    let opponentWalls = [
        ["19", 0],
        ["25", 0],
        ["34", 0]
    ];
    let ownWalls = [
        ["38", 1],
        ["16", 0],
        ["52", 0],
        ["59", 0]
    ];
    let board = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 2, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];
    setup(1).then((position) => {
    });
    let start = Date.now();
    nextMove({board, opponentWalls, ownWalls}).then((move) => {
        console.log("NEXT MOVE: ", move);
        let timeTaken = Date.now() - start;
        console.log("Total time taken : " + timeTaken + " milliseconds");
    });
}

module.exports = { setup, nextMove };