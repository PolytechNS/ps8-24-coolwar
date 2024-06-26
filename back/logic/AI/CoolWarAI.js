// CoolWar.js
// ------------------- VARIABLES ----------------------------------

const {Djikstra} = require("../Model/Graph/Djikstra.js");
const {Graph} = require("../Model/Graph/Graph.js");
const {Position} = require("../Model/Objects/Position.js");
const{WallDictionary} = require("../Model/Objects/WallDictionary.js");
const {PlayableSquareDictionary} = require("../Model/Objects/PlayableSquareDictionary.js");

let finishLine = null; // trouver la ligne d'arrivée
let playOrder = null;

let moveCount =0; // le nombre de mouvements effectués par l'IA
let wallCount = 0; // le nombre de murs placés par l'IA
let totalWallCount= 0; // le nombre total de murs placés par l'IA
let numberOfRound = 1; // le nombre de tours que nous avons fait


function resetAllInformations() {
    finishLine = null;
    playOrder = null;
    moveCount = 0;
    totalWallCount = 0;
    wallCount = 0;
    numberOfRound = 1;
}

// setup function
function setup(AIplay) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            playOrder = AIplay;
            const res = setupIA(AIplay);
            if(res!==null){resolve(res);}
            else{reject("Internal Error From IA Setup");}
        }, 1);
    });

    function setupIA(AIplay){
        resetAllInformations();
        console.log("-----SETUP IA-----");
        let position = null;
        let rand = Math.round(Math.random() * 8) + 1;
        if(AIplay === 1){
            position = rand.toString()+"9";
            finishLine = parseInt("1");
            console.log("FINISH LINE AFTER INIT : ",finishLine);
        }
        else{
            position = rand.toString()+"1";
            finishLine = parseInt("9");
            console.log("FINISH LINE AFTER INIT : ",finishLine);
        }
        console.log("------END SETUP IA------");
        return position;
    }
}

// Rceal_nextMove function
function nextMove(gameState) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let start = Date.now();
            const res = Real_nextMove(gameState);
            if(res!==null){resolve(res);
                let timeTaken = Date.now() - start;
                console.log("Total time taken : " + timeTaken + " milliseconds");}
            else{reject("Internal Error From IA NEXT MOVE");}
        }, 10);
    });
}

function Real_nextMove(gameState) {
    console.log("GAME STATE -------->", gameState);
    console.log("-----REAL NEXT MOVE-----");
    //ON PRENDS EN COMPTE TOUS LES DOUBLES MURS
    let [realOwnWalls, realOpponentWalls] = computeRealWallList(gameState.ownWalls,gameState.opponentWalls);
    console.log("REAL OWN WALLS : ",realOwnWalls);
    console.log("REAL OPPONENT WALLS : ",realOpponentWalls);
    console.log("my position in list : ",myPosition(gameState.board));
    let initOpponentPos = opponentPosition(gameState.board);
    console.log("OPPONENT VISIBLE ?",initOpponentPos!==null);

    //SI LES DERNIERES ACTIONS ETAIENT DES MURS EN PLUS
    if(wallCount > 3 ){
        wallCount = 0;
        return moveCharacterWithDjikstra();
    }
    if(initOpponentPos!==null) {
        if (!isRentableToPlaceWall(gameState)) {
            console.log("PAS RENTABLE DE POSER UN MUR !!");
            return moveCharacterWithDjikstra();
        }
    }
    //SI ON COMMENCE EN BAS
    if(finishLine === 9){
        //SI ROUND 1
        if(numberOfRound === 1){
            //ON POSE UN MUR EN 7,8
            console.log("PLACED FIRST WALL");
            let valToReturn = placeWall([7,8],1,gameState);
            wallCount = 0;
            return valToReturn;
        }
        //SI ROUND 2
        else if(numberOfRound === 2){
            //SI ON NE LE VOIT PAS, ON POSE UN MUR EN 3,7
            if(initOpponentPos === null){
                let valToReturn = placeWall([5,7],1,gameState);
                wallCount = 0;
                return valToReturn;
            }
            //SINON, C'EST QU'ON LE VOIT --> CUVE
        }
        //SI ROUND 3
        else if (numberOfRound === 3){
            //SI ON NE LE VOIT PAS, ON POSE UN MUR HORIZONTAL 1,6
            if(initOpponentPos === null){
                let valToReturn = placeWall([2,6], 1,gameState);
                wallCount = 0;
                return valToReturn;
            }
            //SINON, C'EST QU'ON LE VOIT --> CUVE
        }
    }
    else if(finishLine === 1){
        //SI ROUND 1
        if(numberOfRound === 1){
            //ON POSE UN MUR EN 7,8
            console.log("PLACED FIRST WALL");
            let valToReturn = placeWall([1,6],1,gameState);
            wallCount = 0;
            return valToReturn;
        }
        //SI ROUND 2
        else if(numberOfRound === 2){
            //SI ON NE LE VOIT PAS, ON POSE UN MUR EN 3,7
            if(initOpponentPos === null){
                let valToReturn = placeWall([2,3],1,gameState);
                wallCount = 0;
                return valToReturn;
            }
            //SINON, C'EST QU'ON LE VOIT --> CUVE
        }
        //SI ROUND 3
        else if (numberOfRound === 3){
            //SI ON NE LE VOIT PAS, ON POSE UN MUR HORIZONTAL 1,6
            if(initOpponentPos === null){
                let valToReturn = placeWall([3,0], 0,gameState);
                wallCount = 0;
                return valToReturn;
            }
            //SINON, C'EST QU'ON LE VOIT --> CUVE
        }
    }

    //SI ON CONNAIT LA POSITION DU JOUEUR ADVERSE -> ON MET UN MUR DEVANT LUI
    if(initOpponentPos!==null){
        console.log("JE SAIS OU EST L'ENNEMI !!");
        let falseOpponentPos = convertOurCoordinatesToVellaCooordinates(initOpponentPos[0],initOpponentPos[1])
        let opponentPos = [initOpponentPos[0], initOpponentPos[1]];
        console.log("OPPONENT POSITION ------->",opponentPos);
        //si ma finishLine = 1 --> ma direction = haut // ennemi = bas ||
        if(finishLine !== 1){
            //je verifie qu'il existe un mur en dessous de lui
            let wall = isWallAtPosition(realOwnWalls,realOpponentWalls, opponentPos);
            //SI LE MUR EXISTE, JE REGARDE LES MURS VOISINS
            if(wall!==null){
                console.log("MUR TROUVE ! ");
                //SI LE MUR EST HORIZONTAL
                if(wall[1] === 0){
                    console.log("MUR HORIZONTAL TROUVE ! ");
                    //ON REGARDE S'IL EXISTE UN MUR A GAUCHE
                    let leftHorizontalWallPosition = [null,null];
                    let leftVerticalWallPosition = [null,null];

                    //il est au bord haut de la grid
                    if(parseInt(opponentPos[1]) === 9){
                        console.log("BORD HAUT DE LA GRILLE");
                        //il est en haut à gauche (horizontal gauche ne sert à rien)
                        if(parseInt(opponentPos[0]) === 1){leftHorizontalWallPosition = [null,null];}
                        //il a un mur d'ecart (on ne regarde qu'a un écart de un)
                        else if(parseInt(opponentPos[0]) === 2){leftHorizontalWallPosition = [opponentPos[0] - 1, opponentPos[1]];}
                        //RAS
                        else{ leftHorizontalWallPosition = [opponentPos[0] - 2, opponentPos[1]];}
                        //VERTICAL -> SI ON REGARDE CE MUR, MOUVEMENT ILLEGAL SI UN MUR HORIZONTAL EXISTE
                        leftVerticalWallPosition = [opponentPos[0] - 1, opponentPos[1]];
                    }
                    //il est au bord bas de la grid
                    else if(parseInt(opponentPos[1]) === 1){
                        //il est en bas à gauche (horizontal gauche ne sert à rien)
                        if(parseInt(opponentPos[0]) === 1){leftHorizontalWallPosition = [null,null];}
                        //il a un mur d'ecart
                        else if(parseInt(opponentPos[0]) === 2){leftHorizontalWallPosition = [opponentPos[0] - 1, opponentPos[1]];}
                        //RAS
                        else{ leftHorizontalWallPosition = [opponentPos[0] - 2, opponentPos[1]];}
                        //VERTICAL
                        leftVerticalWallPosition = [opponentPos[0] - 2, opponentPos[1]];
                    }
                    //en plein milieu de la grid
                    else {
                        leftHorizontalWallPosition = [opponentPos[0] - 2, opponentPos[1]];
                        leftVerticalWallPosition = [opponentPos[0] - 1, opponentPos[1] + 1];
                    }

                    console.log("LEFT HORIZONTAL WALL POSITION : ", leftHorizontalWallPosition);
                    console.log("LEFT VERTICAL WALL POSITION : ", leftVerticalWallPosition);

                    let isLeftHorizontalWallExist = isWallAtPosition(realOwnWalls,realOpponentWalls, leftHorizontalWallPosition);
                    let isLeftVerticalWallExist = isWallAtPosition(realOwnWalls,realOpponentWalls, leftVerticalWallPosition)
                    //S'IL N'EXISTE PAS, ON POSE ABSOLUMENT UN MUR A GAUCHE (BLOQUAGE >>)
                    if (!isLeftHorizontalWallExist && !isLeftVerticalWallExist) {
                        console.log("VOISIN DU MUR HORIZONTAL GAUCHE NON TROUVE ! --> ON POSE UN MUR A GAUCHE");
                        console.log("LEFT HORIZONTAL DJIKSTRA");
                        let djikstraLeftHorizontalResult = computeDjikstraForSpecificWall(gameState, wall, 'H', 'G',2);
                        console.log("LEFT VERTICAL DJIKSTRA");
                        let djikstraLeftVerticalResult = computeDjikstraForSpecificWall(gameState, wall, 'V', 'G',1);

                        console.log("DJIKSTRA LEFT HORIZONTAL : ", djikstraLeftHorizontalResult);
                        console.log("DJIKSTRA LEFT VERTICAL : ", djikstraLeftVerticalResult);

                        //ON APPLIQUE VERTICAL RESULTS
                        if(djikstraLeftHorizontalResult=== Infinity && djikstraLeftVerticalResult !== Infinity){
                            return placeWall(leftVerticalWallPosition, 1,gameState);
                        }
                        //ON APPLIQUE HORIZONTAL RESULTS
                        else if(djikstraLeftHorizontalResult !== Infinity && djikstraLeftVerticalResult === Infinity){
                            return placeWall(leftVerticalWallPosition, 0,gameState);
                        }
                        //ON CANCEL LE MOVE -> AUTRE CHOIX
                        else if(djikstraLeftHorizontalResult === Infinity && djikstraLeftVerticalResult === Infinity){
                            //TODO : MOVE A CHOISIR !
                        }
                        //LES DEUX VALEURS SONT BONNES, ON COMPARE
                        else{
                            //On compare les deux valeurs et on prend la plus grande valeur des deux
                            if (djikstraLeftHorizontalResult > djikstraLeftVerticalResult) {
                                console.log("KEEPING LEFT HORIZONTAL WALL");
                                return placeWall(leftHorizontalWallPosition, 0,gameState);
                            }
                            else {
                                console.log("KEEPING LEFT VERTICAL WALL");
                                return placeWall(leftVerticalWallPosition,1,gameState);
                            }
                        }
                    }
                        //SINON
                    //ON REGARDE S'IL EXISTE UN MUR A DROITE
                    else {
                        let rightHorizontalWallPosition = [null,null];
                        let rightVerticalWallPosition = [null,null];

                        //il est au bord haut de la grid
                        if(parseInt(opponentPos[1]) === finishLine){
                            console.log("BORD HAUT DROIT DE LA GRILLE");
                            //il est en haut à gauche (horizontal gauche ne sert à rien)
                            if(parseInt(opponentPos[0]) === 9){rightHorizontalWallPosition = [null,null];}
                            //il a un mur d'ecart (on ne regarde qu'a un écart de un)
                            else if(parseInt(opponentPos[0]) === 8){rightHorizontalWallPosition = [opponentPos[0] , opponentPos[1]];}
                            //RAS
                            else{ rightHorizontalWallPosition = [opponentPos[0]+1, opponentPos[1]];}
                            //VERTICAL -> SI ON REGARDE CE MUR, MOUVEMENT ILLEGAL SI UN MUR HORIZONTAL EXISTE
                            rightVerticalWallPosition = [opponentPos[0] + 1, opponentPos[1]];
                        }
                        //en plein milieu de la grid
                        else {
                            rightHorizontalWallPosition = [opponentPos[0] + 2, opponentPos[1]];
                            rightVerticalWallPosition = [opponentPos[0], opponentPos[1] + 1];
                        }

                        let isRightHorizontalWallExist = isWallAtPosition(realOwnWalls,realOpponentWalls, rightHorizontalWallPosition);
                        let isRightVerticalWallExist = isWallAtPosition(realOwnWalls,realOpponentWalls, rightVerticalWallPosition);

                        if (!isRightHorizontalWallExist && !isRightVerticalWallExist) {
                            console.log("VOISIN DU MUR HORIZONTAL DROITE NON TROUVE ! --> ON POSE UN MUR A DROITE");
                            let djikstraRightHorizontalResult = computeDjikstraForSpecificWall(gameState, wall, 'H', 'R',2);
                            let djikstraRightVerticalResult = computeDjikstraForSpecificWall(gameState, wall, 'V', 'R',1);
                            //On compare les deux valeurs et on prend la plus grande valeur des deux
                            if (djikstraRightHorizontalResult > djikstraRightVerticalResult) {
                                return placeWall(rightHorizontalWallPosition, 0,gameState);
                            }
                            else {
                                return placeWall(rightVerticalWallPosition, 1,gameState);
                            }
                        }
                        else {
                            return moveCharacterWithDjikstra();
                        }
                    }
                }
                //SI LE MUR EST VERTICAL
                else if(wall[1] === 1){
                    console.log("MUR VERTICAL");
                    //ON REGARDE S'IL EXISTE UN MUR HORIZONTAL A GAUCHE
                    let leftHorizontalWallPosition = [opponentPos[0], opponentPos[1]-1];
                    let isLeftHorizontalWallExist = isWallAtPosition(realOwnWalls,realOpponentWalls, leftHorizontalWallPosition);
                    //S'IL N'EXISTE PAS, ON POSE ABSOLUMENT UN MUR A GAUCHE (BLOQUAGE >>)
                    if (!isLeftHorizontalWallExist){return placeWall(leftHorizontalWallPosition,0,gameState)}
                    //ON REGARDE S'IL EXISTE UN MUR A DROITE
                    else{return moveCharacterWithDjikstra();}
                }
            }
            //SI LE MUR N'EXISTE PAS ET QU'ON LE VOIT
            else {return placeWall(opponentPos, 0,gameState);}
        }
        else{
            console.log("JE SAIS OU EST L'ENNEMI INVERT !!");
            //je verifie qu'il existe un mur en dessous de lui
            let wall = isWallAtPosition(realOwnWalls,realOpponentWalls, opponentPos);
            console.log("WALL",wall);
            //SI LE MUR EXISTE, JE REGARDE LES MURS VOISINS
            if(wall!==null){
                console.log("MUR TROUVE INVERT ! ");
                //SI LE MUR EST HORIZONTAL
                if(wall[1] === 0){
                    console.log("MUR HORIZONTAL TROUVE INVERT ! ");
                    //ON REGARDE S'IL EXISTE UN MUR A GAUCHE
                    let leftHorizontalWallPosition = [null,null];
                    let leftVerticalWallPosition = [null,null];

                    //il est au bord haut de la grid
                    if(parseInt(opponentPos[1]) === 9){
                        console.log("BORD HAUT DE LA GRILLE INVERT");
                        //il est en haut à gauche (horizontal gauche ne sert à rien)
                        if(parseInt(opponentPos[0]) === 1){leftHorizontalWallPosition = [null,null];}
                        //il a un mur d'ecart (on ne regarde qu'a un écart de un)
                        else if(parseInt(opponentPos[0]) === 2){leftHorizontalWallPosition = [opponentPos[0] - 1, opponentPos[1]];}
                        //RAS
                        else{ leftHorizontalWallPosition = [opponentPos[0] - 2, opponentPos[1]];}
                        //VERTICAL -> SI ON REGARDE CE MUR, MOUVEMENT ILLEGAL SI UN MUR HORIZONTAL EXISTE
                        leftVerticalWallPosition = [opponentPos[0] - 1, opponentPos[1]];
                    }
                    //il est au bord bas de la grid
                    else if(parseInt(opponentPos[1]) === 1){
                        //il est en bas à gauche (horizontal gauche ne sert à rien)
                        if(parseInt(opponentPos[0]) === 1){leftHorizontalWallPosition = [null,null];}
                        //il a un mur d'ecart
                        else if(parseInt(opponentPos[0]) === 2){leftHorizontalWallPosition = [opponentPos[0] - 1, opponentPos[1]+1];}
                        //RAS
                        else{ leftHorizontalWallPosition = [opponentPos[0] - 2, opponentPos[1]+1];}
                        //VERTICAL
                        leftVerticalWallPosition = [opponentPos[0] - 1, opponentPos[1] + 1];
                    }
                    //en plein milieu de la grid
                    else {
                        leftHorizontalWallPosition = [opponentPos[0] - 2, opponentPos[1]+1];
                        leftVerticalWallPosition = [opponentPos[0] - 1, opponentPos[1] + 1];
                    }

                    console.log("LEFT HORIZONTAL WALL POSITION | INVERT : ", leftHorizontalWallPosition);
                    console.log("LEFT VERTICAL WALL POSITION | INVERT : ", leftVerticalWallPosition);

                    let isLeftHorizontalWallExist = isWallAtPosition(realOwnWalls,realOpponentWalls, leftHorizontalWallPosition);
                    let isLeftVerticalWallExist = isWallAtPosition(realOwnWalls,realOpponentWalls, leftVerticalWallPosition)
                    //S'IL N'EXISTE PAS, ON POSE ABSOLUMENT UN MUR A GAUCHE (BLOQUAGE >>)
                    if (!isLeftHorizontalWallExist && !isLeftVerticalWallExist) {
                        console.log("VOISIN DU MUR HORIZONTAL GAUCHE NON TROUVE ! --> ON POSE UN MUR A GAUCHE INVERT");
                        let djikstraLeftHorizontalResult = computeDjikstraForSpecificWall(gameState, wall, 'H', 'G',2);
                        let djikstraLeftVerticalResult = computeDjikstraForSpecificWall(gameState, wall, 'V', 'G',1);

                        //ON APPLIQUE VERTICAL RESULTS
                        if(djikstraLeftHorizontalResult=== Infinity && djikstraLeftVerticalResult !== Infinity){return placeWall(leftVerticalWallPosition, 1,gameState);}
                        //ON APPLIQUE HORIZONTAL RESULTS
                        else if(djikstraLeftHorizontalResult !== Infinity && djikstraLeftVerticalResult === Infinity){return placeWall(leftVerticalWallPosition, 0,gameState);}
                        //ON CANCEL LE MOVE -> AUTRE CHOIX
                        else if(djikstraLeftHorizontalResult === Infinity && djikstraLeftVerticalResult === Infinity){return moveCharacterWithDjikstra();}
                        //LES DEUX VALEURS SONT BONNES, ON COMPARE
                        else{
                            //On compare les deux valeurs et on prend la plus grande valeur des deux
                            if (djikstraLeftHorizontalResult > djikstraLeftVerticalResult) {
                                console.log("KEEPING LEFT HORIZONTAL WALL | INVERT");
                                if(leftHorizontalWallPosition[0] !== null && leftHorizontalWallPosition[1] !== null){
                                    return placeWall(leftHorizontalWallPosition, 0,gameState);
                                }
                                else{
                                    return moveCharacterWithDjikstra();
                                }
                            }
                            else {
                                console.log("KEEPING LEFT VERTICAL WALL | INVERT");
                                if(leftVerticalWallPosition[0] !== null && leftVerticalWallPosition[1] !== null){
                                    return placeWall(leftVerticalWallPosition,1,gameState);
                                }
                                else{
                                    return moveCharacterWithDjikstra();
                                }
                            }
                        }
                    }
                        //SINON
                    //ON REGARDE S'IL EXISTE UN MUR A DROITE
                    else {
                        let rightHorizontalWallPosition = [null,null];
                        let rightVerticalWallPosition = [null,null];
                        //S'IL EST AU BORD BAS A DROITE DE LA GRID
                        if(parseInt(opponentPos[1]) === 9){
                            console.log("BORD BAS DE LA GRILLE INVERT");
                            //il est en haut à gauche (horizontal gauche ne sert à rien)
                            if(parseInt(opponentPos[0]) === 9){rightHorizontalWallPosition = [null,null];}
                            //il a un mur d'ecart (on ne regarde qu'a un écart de un)
                            else if(parseInt(opponentPos[0]) === 8){rightHorizontalWallPosition = [opponentPos[0], opponentPos[1]+1];}
                            //RAS
                            else{ rightHorizontalWallPosition = [opponentPos[0] + 2, opponentPos[1]+1];}
                            //VERTICAL -> SI ON REGARDE CE MUR, MOUVEMENT ILLEGAL SI UN MUR HORIZONTAL EXISTE
                            rightVerticalWallPosition = [opponentPos[0], opponentPos[1] +1];
                        }

                        let isRightHorizontalWallExist = isWallAtPosition(realOwnWalls,realOpponentWalls, rightHorizontalWallPosition);
                        let isRightVerticalWallExist = isWallAtPosition(realOwnWalls,realOpponentWalls, rightVerticalWallPosition);

                        if (!isRightHorizontalWallExist && !isRightVerticalWallExist) {
                            console.log("VOISIN DU MUR HORIZONTAL DROITE NON TROUVE ! --> ON POSE UN MUR A DROITE INVERT");
                            let djikstraRightHorizontalResult = computeDjikstraForSpecificWall(gameState, wall, 'H', 'R',2);
                            let djikstraRightVerticalResult = computeDjikstraForSpecificWall(gameState, wall, 'V', 'R',1);
                            //On compare les deux valeurs et on prend la plus grande valeur des deux
                            if (djikstraRightHorizontalResult > djikstraRightVerticalResult) {
                                if(rightHorizontalWallPosition[0] !== null && rightHorizontalWallPosition[1] !== null) {
                                    return placeWall(rightHorizontalWallPosition, 0,gameState);
                                }
                                else{
                                    return moveCharacterWithDjikstra();
                                }
                            }
                            else {
                                if(rightVerticalWallPosition[0] !== null && rightVerticalWallPosition[1] !== null) {
                                    return placeWall(rightVerticalWallPosition, 1, gameState);
                                }
                                else{
                                    return moveCharacterWithDjikstra();
                                }
                            }
                        }
                        else {return moveCharacterWithDjikstra();}
                    }
                }
                //SI LE MUR EST VERTICAL
                else if(wall[1] === 1){
                    console.log("MUR VERTCIAL TROUVE INVERT ! ");
                    //ON REGARDE S'IL EXISTE UN MUR HORIZONTAL A GAUCHE
                    let leftHorizontalWallPosition = [opponentPos[0]-1, opponentPos[1]];
                    let isLeftHorizontalWallExist = isWallAtPosition(realOwnWalls,realOpponentWalls, leftHorizontalWallPosition);
                    //S'IL N'EXISTE PAS, ON POSE ABSOLUMENT UN MUR A GAUCHE (BLOQUAGE >>)
                    if (!isLeftHorizontalWallExist){return placeWall(leftHorizontalWallPosition,0,gameState)}
                    //ON REGARDE S'IL EXISTE UN MUR A DROITE
                    else{return moveCharacterWithDjikstra();}
                }
            }
            //SI LE MUR N'EXISTE PAS ET QU'ON LE VOIT ET QUE L'ENNEMI VA EN HAUT
            else {return placeWall(opponentPos, 0,gameState);}
        }
    }
    //ON BOUGE NOTRE PERSONNAGE
    else{
        console.log("ON BOUGE NOTRE PERSONNAGE -> PAS DE POSITION ADVERSE CONNUE");
        return moveCharacterWithDjikstra();
    }

    // --------------------- INTERNAL FUNCTIONS ---------------------------------- //

    function moveCharacterWithDjikstra(){
        console.log("---MOVE CHARACTER WITH DJIKSTRA---");
        const [playableSquares, horizontalWalls, verticalWalls] = convertGameStateToGamemodel(gameState);

        let graph = new Graph(playableSquares, horizontalWalls, verticalWalls);
        //console.log("GRAPH : ",graph);
        const ownPosition = [myPosition(gameState.board)[0], myPosition(gameState.board)[1]];
        console.log("OUR OWN POSITION : ",ownPosition);
        const ownNode = graph.getNodeFromCoordinates(ownPosition[0], ownPosition[1]);
        //console.log("OWN NODE ->",ownNode);
        console.log("FINISH LINE : ",finishLine);
        let bestRes = null;
        //COMPUTE POUR TOUTE LA LIGNE
        for (let i = 0; i < 9; i++) {
            let endNode = graph.getNodeFromCoordinates( finishLine-1, i);
            if(endNode!==null){
                let res = Djikstra.prototype.compute_djikstra(graph, ownNode, endNode);
                if (bestRes === null) {bestRes = res;}
                else if (res.distance < bestRes.distance) {bestRes = res;}
            }
        }
        //for(let i=0;i<bestRes.path.length;i++){
        // console.log(bestRes.path[i].position);
        //}
        console.log("BEST PATH",bestRes.path);
        let nextMove = bestRes.path[1].position;
        let finalPosition = [nextMove.row, nextMove.col];
        console.log("FINAL POSITION ", finalPosition);
        return moveCharacter(finalPosition);
    }
    function isWallAlreadyExists(wallList, opponentPos){
        let isExists = null;
        wallList.forEach(function (wall) {
            let wallPosition = wall[0].split("");
            let realWallPosition = convertVellaCooordinatesToOurs(wallPosition[0], wallPosition[1]);
            console.log("WALL POSITION HERE -->",realWallPosition);
            console.log("OPPONENT POSITION HERE -->",opponentPos);
            //si il y a deja un mur devant la personne
            if(parseInt(realWallPosition[1]) === parseInt(opponentPos[1]) && parseInt(realWallPosition[0]) === parseInt(opponentPos[0])
            || (parseInt(realWallPosition[1])+1) === parseInt(opponentPos[1]) && parseInt(realWallPosition[0]) === parseInt(opponentPos[0]) ){
                isExists=wall;
                console.log("WALL EXISTS ! ");
            }
        });
        return isExists;
    }
    function isWallAtPosition(realOwnWalls,realOpponentWalls,position){
        console.log("IS WALL AT POSITION -->",position);
        let wallExists = isWallAlreadyExists(realOpponentWalls, position);
        if(wallExists === null){wallExists = isWallAlreadyExists(realOwnWalls, position);}
        return wallExists;
    }
    //TODO: GAMESTATE = [BOARD COMPUTE, WALLS RECEIVED, **]
    function computeDjikstaFor(gameState,player){
        console.log("---COMPUTE DJIKSTRA FOR--- ");
        if(player==="me"){
            console.log("---ME--- ");
            const [playableSquares, horizontalWalls, verticalWalls] = convertGameStateToGamemodel(gameState);
            let graph = new Graph(playableSquares, horizontalWalls, verticalWalls);
            const ownPosition = [myPosition(gameState.board)[0],myPosition(gameState.board)[1]];
            const ownNode = graph.getNodeFromCoordinates(ownPosition[0], ownPosition[1]);
            console.log("OWN NODE",ownNode);
            let bestRes = null;
            //COMPUTE POUR TOUTE LA LIGNE
            for (let i = 0; i < 8; i++) {
                let res = Djikstra.prototype.compute_djikstra(graph, ownNode, graph.getNodeFromCoordinates(i,invertFinishLine()-1));
                if (bestRes === null) {bestRes = res;} else if (res.distance < bestRes.distance) {bestRes = res;}
            }
            return bestRes;
        }
        else if(player==="opponent"){
            console.log("---OPPONENT--- ");
            const [playableSquares, horizontalWalls, verticalWalls] = convertGameStateToGamemodel(gameState);
            let graph = new Graph(playableSquares, horizontalWalls, verticalWalls);
            const oppPos = opponentPosition(gameState.board);
            const oppNode = graph.getNodeFromCoordinates(oppPos[0], oppPos[1]);
            let bestRes = null;
            //COMPUTE POUR TOUTE LA LIGNE
            for (let i = 0; i < 8; i++) {
                let res = Djikstra.prototype.compute_djikstra(graph, oppNode, graph.getNodeFromCoordinates(i, finishLine));
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
    function computeDjikstraForSpecificWall(gameState,rootWall,typeWallToAnalysis,directionToAnalysis,diff){
        console.log("ROOT WALL : ",rootWall);
        console.log("TYPE WALL TO ANALYSIS : ",typeWallToAnalysis);
        console.log("DIRECTION TO ANALYSIS : ",directionToAnalysis);
        console.log("DIFF : ",diff);

        if(finishLine === 9){
            //SI LE MUR EST HORIZONTAL
            if(rootWall[1]===0){
                if(typeWallToAnalysis === 'H' && directionToAnalysis === 'G'){
                    console.log("MUR HORIZONTAL GAUCHE !");
                    let hypoteticCase = JSON.parse(JSON.stringify(gameState));
                    //on place le mur horizontal dans le gameState Copie
                    hypoteticCase.ownWalls.push([(parseInt(rootWall[0])-diff).toString()+rootWall[1].toString(), 0]);
                    //ON REGARDE LA DISTANCE AVEC DIJKSTRA
                    return computeDjikstaFor(hypoteticCase,"opponent");
                }
                if(typeWallToAnalysis === 'H' && directionToAnalysis === 'D'){
                    console.log("MUR HORIZONTAL DROITE !");
                    let hypoteticCase = JSON.parse(JSON.stringify(gameState));
                    //on place le mur horizontal dans le gameState Copie
                    hypoteticCase.ownWalls.push([(parseInt(rootWall[0])+diff).toString()+rootWall[1].toString(), 0]);
                    //ON REGARDE LA DISTANCE AVEC DIJKSTRA
                    return computeDjikstaFor(hypoteticCase,"opponent");
                }
                if(typeWallToAnalysis === 'V' && directionToAnalysis === 'G'){
                    let hypoteticCase = JSON.parse(JSON.stringify(gameState));
                    //on place le mur horizontal dans le gameState Copie
                    hypoteticCase.ownWalls.push([(parseInt(rootWall[0])-diff).toString()+(parseInt(rootWall[1])+diff).toString(), 1]);
                    //ON REGARDE LA DISTANCE AVEC DIJKSTRA
                    return computeDjikstaFor(hypoteticCase,"opponent");
                }
                if(typeWallToAnalysis === 'V' && directionToAnalysis === 'D'){
                    let hypoteticCase = JSON.parse(JSON.stringify(gameState));
                    //on place le mur horizontal dans le gameState Copie
                    hypoteticCase.ownWalls.push([(parseInt(rootWall[0])+diff).toString()+(parseInt(rootWall[1])+diff).toString(), 1]);
                    //ON REGARDE LA DISTANCE AVEC DIJKSTRA
                    return computeDjikstaFor(hypoteticCase,"opponent");
                }
            }
            //SI LE MUR EST VERTICAL
            if(rootWall[1] === 1){
                if(typeWallToAnalysis === 'H' && directionToAnalysis === 'G'){
                    let hypoteticCase = JSON.parse(JSON.stringify(gameState));
                    //on place le mur horizontal dans le gameState Copie
                    hypoteticCase.ownWalls.push([(parseInt(rootWall[0])-diff).toString()+(parseInt(rootWall[1])-diff).toString(), 0]);
                    //ON REGARDE LA DISTANCE AVEC DIJKSTRA
                    return computeDjikstaFor(hypoteticCase,"opponent");
                }
                if(typeWallToAnalysis === 'H' && directionToAnalysis === 'D'){
                    let hypoteticCase = JSON.parse(JSON.stringify(gameState));
                    //on place le mur horizontal dans le gameState Copie
                    hypoteticCase.ownWalls.push([(parseInt(rootWall[0])+diff).toString()+(parseInt(rootWall[1])-diff).toString(), 0]);
                    //ON REGARDE LA DISTANCE AVEC DIJKSTRA
                    return computeDjikstaFor(hypoteticCase,"opponent");
                }
            }
        }
        else if(finishLine === 1){
            //SI LE MUR EST HORIZONTAL
            if(rootWall[1]===0){
                if(typeWallToAnalysis === 'H' && directionToAnalysis === 'G'){
                    console.log("MUR HORIZONTAL GAUCHE !");
                    let hypoteticCase = JSON.parse(JSON.stringify(gameState));
                    //on place le mur horizontal dans le gameState Copie
                    hypoteticCase.ownWalls.push([(parseInt(rootWall[0])-diff).toString()+(parseInt(rootWall[1])+1).toString(), 0]);
                    //ON REGARDE LA DISTANCE AVEC DIJKSTRA
                    return computeDjikstaFor(hypoteticCase,"opponent");
                }
                if(typeWallToAnalysis === 'H' && directionToAnalysis === 'D'){
                    console.log("MUR HORIZONTAL DROITE !");
                    let hypoteticCase = JSON.parse(JSON.stringify(gameState));
                    //on place le mur horizontal dans le gameState Copie
                    hypoteticCase.ownWalls.push([(parseInt(rootWall[0])+diff).toString()+(parseInt(rootWall[1])+1).toString(), 0]);
                    //ON REGARDE LA DISTANCE AVEC DIJKSTRA
                    return computeDjikstaFor(hypoteticCase,"opponent");
                }
                if(typeWallToAnalysis === 'V' && directionToAnalysis === 'G'){
                    let hypoteticCase = JSON.parse(JSON.stringify(gameState));
                    //on place le mur horizontal dans le gameState Copie
                    hypoteticCase.ownWalls.push([(parseInt(rootWall[0])-diff).toString()+(parseInt(rootWall[1])+diff).toString(), 1]);
                    //ON REGARDE LA DISTANCE AVEC DIJKSTRA
                    return computeDjikstaFor(hypoteticCase,"opponent");
                }
                if(typeWallToAnalysis === 'V' && directionToAnalysis === 'D'){
                    let hypoteticCase = JSON.parse(JSON.stringify(gameState));
                    //on place le mur horizontal dans le gameState Copie
                    hypoteticCase.ownWalls.push([(parseInt(rootWall[0])+diff).toString()+(parseInt(rootWall[1])+diff).toString(), 1]);
                    //ON REGARDE LA DISTANCE AVEC DIJKSTRA
                    return computeDjikstaFor(hypoteticCase,"opponent");
                }
            }
            //SI LE MUR EST VERTICAL
            if(rootWall[1] === 1){
                if(typeWallToAnalysis === 'H' && directionToAnalysis === 'G'){
                    let hypoteticCase = JSON.parse(JSON.stringify(gameState));
                    //on place le mur horizontal dans le gameState Copie
                    hypoteticCase.ownWalls.push([(parseInt(rootWall[0])-diff).toString()+(parseInt(rootWall[1])+diff).toString(), 0]);
                    //ON REGARDE LA DISTANCE AVEC DIJKSTRA
                    return computeDjikstaFor(hypoteticCase,"opponent");
                }
                if(typeWallToAnalysis === 'H' && directionToAnalysis === 'D'){
                    let hypoteticCase = JSON.parse(JSON.stringify(gameState));
                    //on place le mur horizontal dans le gameState Copie
                    hypoteticCase.ownWalls.push([(parseInt(rootWall[0])+diff).toString()+(parseInt(rootWall[1])+diff).toString(), 0]);
                    //ON REGARDE LA DISTANCE AVEC DIJKSTRA
                    return computeDjikstaFor(hypoteticCase,"opponent");
                }
            }
        }

    }
    function placeWall(position,type,gameState){
        console.log("PLACE WALL WITH POSITION", position);
        // console.log("IS HE CUTTING WALL ?",isCuttingWall(gameState,position,type));
        //UN MUR EST COUPE --> ON CHERCHE UNE POSITION VALIDE PERMETTANT DE POSER LE MUR
        let wallReturn = isCuttingWall(gameState,position,type);
        if(wallReturn !==null){
            //SI LE MUR QUI DERANGE EST HORIZONTAL
            if(wallReturn[1] === 0){
                console.log("MUR QUI DERANGE HORIZONTAL");
                console.log("TYPE ",type);
                //SI LE MUR QU'ON VEUT POSER EST HORIZONTAL
                if(type === 0){
                    let wallPosition = wallReturn[0].split("");
                    let diff = parseInt(wallPosition[0]) - parseInt(position[0]);
                    console.log("DIF", diff);
                    //IL EST A GAUCHE
                    if(diff<0){
                        console.log("MUR QUI CASSE LES COUILLES A GAUCHE DE NOUS --> ON CHECK A DROTIE");
                        let wallToCompute = [(parseInt(wallPosition[0])+1).toString() + parseInt(wallPosition[1]).toString(), type];
                        console.log("WALL POSITION : ",wallPosition);
                        console.log("WALL TO COMPUTE : ",wallToCompute);
                        console.log("QUELQU'UN A DROITE ?",isCuttingWall(gameState,wallToCompute[0],wallToCompute[1]));
                        if(isCuttingWall(gameState,wallToCompute[0],wallToCompute[1]) === null){
                            console.log("PAS DE MUR A DROITE, ON PLACE !");
                            lastMove = "wall";
                            wallCount++;
                            numberOfRound++;
                            totalWallCount++;
                            console.log("NUMBER OF ROUND : ", numberOfRound);
                            console.log("WALL COUNT : ", wallCount);
                            console.log("TOTAL WALL : ", totalWallCount);
                            console.log("MOVE COUNT : ", moveCount);
                            return {
                                action: "wall",
                                value: [wallToCompute[0], wallToCompute[1]]
                            };
                        }
                        else{
                            //ON REGARDE A DROITE²
                            if(parseInt(wallPosition[0])+2 < 9){
                                wallToCompute = [(parseInt(wallPosition[0])+2).toString() + wallPosition[1].toString(), type];
                                console.log("QUELQU'UN A DROITE² ?",isCuttingWall(gameState,wallToCompute[0],wallToCompute[1]));
                                if(isCuttingWall(gameState,wallToCompute[0],wallToCompute[1]) === null){
                                    console.log("PAS DE MUR A DROITE², ON PLACE !");
                                    lastMove = "wall";
                                    wallCount++;
                                    numberOfRound++;
                                    totalWallCount++;
                                    console.log("NUMBER OF ROUND : ", numberOfRound);
                                    console.log("WALL COUNT : ", wallCount);
                                    console.log("TOTAL WALL : ", totalWallCount);
                                    console.log("MOVE COUNT : ", moveCount);
                                    return {
                                        action: "wall",
                                        value: [wallToCompute[0], wallToCompute[1]]
                                    };
                                }
                                else{
                                    //FLEMME DE CHERCHER PLUS LOIN, ON FAIT DU SPORT ??‍♂️
                                    return moveCharacterWithDjikstra();
                                }
                            }
                            else{
                                //FLEMME DE CHERCHER PLUS LOIN, ON FAIT DU SPORT ??‍♂️
                                return moveCharacterWithDjikstra();
                            }
                        }
                    }
                    //IL EST A DROITE
                    else if(diff>0){
                        console.log("MUR QUI CASSE LES COUILLES A DROITE DE NOUS --> ON CHECK A GAUCHE");
                        let wallToCompute = [(wallPosition[0]-2).toString() + wallPosition[1].toString(), type];
                        console.log("QUELQU'UN A GAUCHE?",isCuttingWall(gameState,wallToCompute[0],wallToCompute[1]));
                        if(isCuttingWall(gameState,wallToCompute[0],wallToCompute[1]) === null){
                            console.log("PAS DE MUR A GAUCHE, ON PLACE !");
                            lastMove = "wall";
                            wallCount++;
                            numberOfRound++;
                            totalWallCount++;
                            console.log("NUMBER OF ROUND : ", numberOfRound);
                            console.log("WALL COUNT : ", wallCount);
                            console.log("TOTAL WALL : ", totalWallCount);
                            console.log("MOVE COUNT : ", moveCount);
                            return {
                                action: "wall",
                                value: [wallToCompute[0], wallToCompute[1]]
                            };
                        }
                    }
                    //FLEMME DE CHERCHER PLUS LOIN, ON FAIT DU SPORT 🏃‍♂️
                    else{return moveCharacterWithDjikstra();}
                }
                //SI LE MUR QU'ON VEUT POSER EST VERTICAL
                else if(type === 1){
                }
            }
            // SI LE MUR QUI DERANGE EST VERTICAL
            else if(wallReturn[1] === 1){
                console.log("MUR QUI DERANGE VERTICAL");
                //SI LE MUR QU'ON VEUT POSER EST HORIZONTAL
                if(type === 0){
                    let positionToCheck = position[0].toString()+(parseInt(position[1])-1).toString()
                    //IL FAUT DECALLER NOTRE MUR A GAUCHE OU A DROITE
                    //ON REGARDE QUELLE CONFIGURATION CASSE LE PLUS LES COUILLES
                    let leftDjikstra = computeDjikstraForSpecificWall(gameState,[positionToCheck,type],'H','G',1);
                    let righDjikstra = computeDjikstraForSpecificWall(gameState,[positionToCheck,type],'H','D',1);

                    console.log("LEFT DJIKSTRA : ",leftDjikstra.distance);
                    console.log("RIGHT DJIKSTRA : ",righDjikstra.distance);

                    if(leftDjikstra.distance < righDjikstra.distance){
                        console.log("ON POSE UN MUR A GAUCHE");
                        console.log("POSITION TO CHECK",positionToCheck);
                        if(isCuttingWall(gameState,[positionToCheck],type) === null){
                            console.log("PAS DE MUR A GAUCHE, ON PLACE !");
                            lastMove = "wall";
                            wallCount++;
                            numberOfRound++;
                            totalWallCount++;
                            console.log("NUMBER OF ROUND : ", numberOfRound);
                            console.log("WALL COUNT : ", wallCount);
                            console.log("TOTAL WALL : ", totalWallCount);
                            console.log("MOVE COUNT : ", moveCount);
                            return {
                                action: "wall",
                                value: [positionToCheck, type]
                            };
                        }
                    }
                    else{
                        console.log("ON POSE UN MUR A DROITE");
                        console.log("POSITION",position);
                        if(isCuttingWall(gameState,[positionToCheck],type) === null){
                            console.log("PAS DE MUR A DROITE, ON PLACE !");
                            lastMove = "wall";
                            wallCount++;
                            numberOfRound++;
                            totalWallCount++;
                            console.log("NUMBER OF ROUND : ", numberOfRound);
                            console.log("WALL COUNT : ", wallCount);
                            console.log("TOTAL WALL : ", totalWallCount);
                            console.log("MOVE COUNT : ", moveCount);
                            return {
                                action: "wall",
                                value: [positionToCheck, type]
                            };
                        }
                    }
                }
                //SI LE MUR QU'ON VEUT POSER EST VERTICAL
                else if(type === 1){
                }
            }
        }
        //LE MUR NE COUPE PERSONNE, ON REGARDE S'IL PEUT ETRE PLACABLE --> ON RETOURNE CE MOUVEMENT
        else {
            //S'IL EST AUX LIMITES DE LA GRID, ON DECALLE ET ON REGARDE
            if(position[0] === parseInt("9")){
                //ON VEUT POUVOIR POSER UN MUR A LA LIMITE DROITE DE LA GRID
                let positionWallLimite = [position[0]-1, position[1]];
                return placeWall(positionWallLimite, type, gameState);
                //return moveCharacterWithDjikstra();
            }
            //QUAND LE MUR QU'ON VEUT POSER EST EN BAS DU PLATEAU --> IMPOSSIBLE !
            else if(position[1]===parseInt("1")){return moveCharacterWithDjikstra();}
            else{
                lastMove = "wall";
                wallCount++;
                numberOfRound++;
                totalWallCount++;
                console.log("NUMBER OF ROUND : ", numberOfRound);
                console.log("WALL COUNT : ", wallCount);
                console.log("TOTAL WALL : ", totalWallCount);
                console.log("MOVE COUNT : ", moveCount);
                return {
                    action: "wall",
                    value: [position[0].toString() + position[1].toString(), type]
                };
            }
        }
    }

    function isRentableToPlaceWall(gameState) {
        console.log("IS RENTABLE TO PLACE WALL ?");
        //SI ON EST A LA MOITIE DE NOS MURS -> ON AVANCE
        let ownPosition = myPosition(gameState.board);
        let level = parseInt(ownPosition[1]) - 5;

        let ownDjikstra = computeDjikstaFor(gameState, "me");
        let opponentDjikstra = computeDjikstaFor(gameState, "opponent");
        let opponentIsFurtherAway = ownDjikstra.distance >= opponentDjikstra.distance + 2;
        console.log("OPPONENT IS FURTHER AWAY ? ",opponentIsFurtherAway);
        if(opponentIsFurtherAway){return true;}
        else{
            if (finishLine === 1 && (totalWallCount >= 5 && level >= 0)) {return false;}
            else if (finishLine === 9 && (totalWallCount >= 5 && level <= 0)){ return false;}
        }
    }
    function moveCharacter(position){
        lastMove = "move";
        moveCount++;
        numberOfRound++;
        console.log("NUMBER OF ROUND : ", numberOfRound);
        console.log("WALL COUNT : ", wallCount);
        console.log("TOTAL WALL : ", totalWallCount);
        console.log("MOVE COUNT : ", moveCount);
        return { action: "move", value: parseInt(position[0]).toString() + parseInt(position[1]).toString() };
    }

    function computeRealWallList(ownWalls,opponentWalls){
        let realOwnWalls = [];
        let realOpponentWalls = [];
        ownWalls.forEach(function (wall){
            //SI LE MUR EST HORIZONTAL ON VA AJOUTER LE MUR A SA DOITE
            if(wall[1]===0){
                let rootWallPosition = wall[0].split("");
                if(rootWallPosition[0]===9){
                    let rootWallCopy = [rootWallPosition[0].toString() + rootWallPosition[1].toString(),0];
                    let wallToAdd = [(parseInt(rootWallPosition[0])).toString()+(parseInt(rootWallPosition[1])-1).toString(),0];
                    realOwnWalls.push(wallToAdd);
                    realOwnWalls.push(rootWallCopy);
                }
                else{
                    let rootWallCopy = [rootWallPosition[0].toString() + rootWallPosition[1].toString(),0];
                    let wallToAdd = [(parseInt(rootWallPosition[0])+1).toString()+(parseInt(rootWallPosition[1])).toString(),0];
                    realOwnWalls.push(wallToAdd);
                    realOwnWalls.push(rootWallCopy);
                }
            }
            // SI LE MUR EST VERTICAL
            else if(wall[1]===1){
                let rootWallPosition = wall[0].split("");
                if(rootWallPosition[1] === 1){
                    let rootWallCopy = [rootWallPosition[0].toString() + rootWallPosition[1].toString(),1];
                    let wallToAdd = [(parseInt(rootWallPosition[0])+1).toString()+(parseInt(rootWallPosition[1])).toString(),1];
                    realOwnWalls.push(wallToAdd);
                    realOwnWalls.push(rootWallCopy);
                }
                else{
                    let rootWallCopy = [rootWallPosition[0].toString() + rootWallPosition[1].toString(),1];
                    let wallToAdd = [(parseInt(rootWallPosition[0])).toString()+(parseInt(rootWallPosition[1])-1).toString(),1];
                    realOwnWalls.push(wallToAdd);
                    realOwnWalls.push(rootWallCopy);
                }
            }
        });
        opponentWalls.forEach(function (wall){
            //SI LE MUR EST HORIZONTAL ON VA AJOUTER LE MUR A SA DOITE
            if(wall[1]===0){
                let rootWallPosition = wall[0].split("");
                if(rootWallPosition[0] === 9){
                    let rootWallCopy = [rootWallPosition[0].toString() + rootWallPosition[1].toString(),0];
                    let wallToAdd = [(parseInt(rootWallPosition[0])).toString()+(parseInt(rootWallPosition[1])-1).toString(),0];
                    realOpponentWalls.push(wallToAdd);
                    realOpponentWalls.push(rootWallCopy);
                }
                else{
                    let rootWallCopy = [rootWallPosition[0].toString() + rootWallPosition[1].toString(),0];
                    let wallToAdd = [(parseInt(rootWallPosition[0])+1).toString()+(parseInt(rootWallPosition[1])).toString(),0];
                    realOpponentWalls.push(wallToAdd);
                    realOpponentWalls.push(rootWallCopy);
                }

            }
            // SI LE MUR EST VERTICAL
            else if(wall[1]===1){
                let rootWallPosition = wall[0].split("");
                if(rootWallPosition[1] === 1){
                    let rootWallCopy = [rootWallPosition[0].toString() + rootWallPosition[1].toString(),1];
                    let wallToAdd = [(parseInt(rootWallPosition[0])+1).toString()+(parseInt(rootWallPosition[1])).toString(),1];
                    realOpponentWalls.push(wallToAdd);
                    realOpponentWalls.push(rootWallCopy);
                }
                else{
                    let rootWallCopy = [rootWallPosition[0].toString() + rootWallPosition[1].toString(),1];
                    let wallToAdd = [(parseInt(rootWallPosition[0])).toString()+(parseInt(rootWallPosition[1])-1).toString(),1];
                    realOpponentWalls.push(wallToAdd);
                    realOpponentWalls.push(rootWallCopy);
                }
            }
        });
        return [realOwnWalls, realOpponentWalls];
    }

    function isCuttingWall(gameState,currPos,type) {
        console.log("IS CUTTING WALL ? ", currPos);
        let wallToReturn = null;
        for (let i = 0; i < gameState.ownWalls.length; i++) {
            let wall = gameState.ownWalls[i];
            let wallPosition = wall[0].split("");
            //SI ON VEUT POSER UN MUR HORITONZAL
            if (type === 0) {
                //S'IL EXISTE UN MUR AU MEME ENDROIT (HORIZONTAL OU VERTICAL) --> CA SE CROISE !!
                if (parseInt(wallPosition[1]) === parseInt(currPos[1]) && (parseInt(wallPosition[0]) === parseInt(currPos[0]))) {
                    wallToReturn = wall;
                    break;
                }
                //S'IL EXISTE UN MUR DE 1 VERS LA DROITE OU VERS LA GAUCHE DU MEME TYPE
                else {
                    if (parseInt(wallPosition[1]) === parseInt(currPos[1]) &&
                        (parseInt(wallPosition[0]) + 1 === parseInt(currPos[0]) || parseInt(wallPosition[0]) - 1 === parseInt(currPos[0]))) {
                        wallToReturn = wall;
                        break;
                    }
                }
            }
            //SI ON VEUT POSER UN MUR VERTICAL
            else if (type === 1) {
                console.log("MUR QU'ON VEUT POSER = VERTICAL");
                //S'IL EXISTE UN MUR AU MEME ENDROIT (HORIZONTAL OU VERTICAL) --> CA SE CROISE !!
                if (parseInt(wallPosition[0]) === parseInt(currPos[0]) && (parseInt(wallPosition[1]) === parseInt(currPos[1]))) {
                    wallToReturn = wall;
                    break;
                }
                //S'IL EXISTE UN MUR DE 1 VERS LE HAUT OU VERS LE BAS DU MEME TYPE
                else {
                    if (parseInt(wallPosition[0]) === parseInt(currPos[0]) &&
                        (parseInt(wallPosition[1]) + 1 === parseInt(currPos[1]) || parseInt(wallPosition[1]) - 1 === parseInt(currPos[1])) &&
                        (parseInt(type) === parseInt(wall[1]))) {
                        wallToReturn = wall;
                        break;
                    }
                }
            }
        }
        if (wallToReturn === null) {
            for (let i = 0; i < gameState.opponentWalls.length; i++) {
                let wall = gameState.opponentWalls[i];
                let wallPosition = wall[0].split("");
                if (type === 0) {
                    //S'IL EXISTE UN MUR AU MEME ENDROIT (HORIZONTAL OU VERTICAL) --> CA SE CROISE !!
                    if (parseInt(wallPosition[1]) === parseInt(currPos[1]) && (parseInt(wallPosition[0]) === parseInt(currPos[0]))) {
                        wallToReturn = wall;
                        break;
                    }
                    //S'IL EXISTE UN MUR DE 1 VERS LA DROITE OU VERS LA GAUCHE DU MEME TYPE
                    else {
                        if (parseInt(wallPosition[1]) === parseInt(currPos[1]) &&
                            (parseInt(wallPosition[0]) + 1 === parseInt(currPos[0]) || parseInt(wallPosition[0]) - 1 === parseInt(currPos[0]))) {
                            wallToReturn = wall;
                            break;
                        }
                    }
                }
                //SI ON VEUT POSER UN MUR VERTICAL
                else if (type === 1) {
                    //S'IL EXISTE UN MUR AU MEME ENDROIT (HORIZONTAL OU VERTICAL) --> CA SE CROISE !!
                    if (parseInt(wallPosition[0]) === parseInt(currPos[0]) && (parseInt(wallPosition[1]) === parseInt(currPos[1]))) {
                        wallToReturn = wall;
                        break;
                    }
                    //S'IL EXISTE UN MUR DE 1 VERS LE HAUT OU VERS LE BAS DU MEME TYPE
                    else {
                        if (parseInt(wallPosition[0]) === parseInt(currPos[0]) &&
                            (parseInt(wallPosition[1]) + 1 === parseInt(currPos[1]) || parseInt(wallPosition[1]) - 1 === parseInt(currPos[1])) &&
                            (parseInt(type) === parseInt(wall[1]))) {

                            wallToReturn = wall;
                            break;
                        }
                    }
                }
            }
        }

        return wallToReturn;
    }
}

// correction function
correction = function(rightMove) {
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
updateBoard = function(gameState) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Assuming the AI always accepts the new game state
            resolve(true);
        }, 1);
    });
}

function myPosition(board){
    for (let i = 0; i < board.length; i++) {
        const innerList = board[i];
        for (let j = 0; j < innerList.length; j++) {
            if (board[i][j] === 1){
                return [i,j];
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
                return [i,j];
            }
        }
    }
    return null;
}
function convertVellaCooordinatesToOurs(col,row){
    return [parseInt(row)-1,parseInt(col)-1];
}
function convertOurCoordinatesToVellaCooordinates(row,col){
    return [parseInt(col)+1,9-parseInt(row)];
}
function convertVellaToClassicCoordinates(col,row){
    return [9-parseInt(row),parseInt(col)-1];
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
        let wallPosition = new Position(wall[0].split("")[1],wall[0].split("")[0]);
        //SI MUR HORIZONTAL
        if(parseInt(wall[1])===parseInt("0")){
            let goodCoordinates = convertVellaToClassicCoordinates(wallPosition.col,wallPosition.row);
            //let goodCoordinates = convertVellaCooordinatesToOurs(wallPosition.col,wallPosition.row);
            let wallToEdit = horizontalWalls.getWall(goodCoordinates[0],goodCoordinates[1],'H');
            let neighborOfWallToEdit;
            if(goodCoordinates[1]+1<9){
                neighborOfWallToEdit = horizontalWalls.getWall(goodCoordinates[0],goodCoordinates[1]+1, 'H');
                neighborOfWallToEdit.setPresent();
                neighborOfWallToEdit.setOwner(playOrder);
            }
            else{
                neighborOfWallToEdit = horizontalWalls.getWall(goodCoordinates[0],goodCoordinates[1]-1, 'H');
                neighborOfWallToEdit.setPresent();
                neighborOfWallToEdit.setOwner(playOrder);
            }
            wallToEdit.setPresent();
            wallToEdit.setOwner(opponentPlayOrder);
        }
        //SI MUR VERTICAL
        else if(parseInt(wall[1])===parseInt("1")){
            let goodCoordinates = convertVellaToClassicCoordinates(wallPosition.col,wallPosition.row);
            let wallToEdit = verticalWalls.getWall(goodCoordinates[0],goodCoordinates[1],'V');
            let neighborOfWallToEdit;
            if(goodCoordinates[0]+1<9){
                neighborOfWallToEdit = verticalWalls.getWall(goodCoordinates[0]+1,goodCoordinates[1], 'V');
                neighborOfWallToEdit.setPresent();
                neighborOfWallToEdit.setOwner(playOrder);
            }
            else{
                neighborOfWallToEdit = verticalWalls.getWall(goodCoordinates[0]-1,goodCoordinates[1], 'V');
                neighborOfWallToEdit.setPresent();
                neighborOfWallToEdit.setOwner(playOrder);
            }
            wallToEdit.setPresent();
            wallToEdit.setOwner(opponentPlayOrder);
        }
    });

    gameState.ownWalls.forEach(function (wall){
        let wallPosition = new Position(wall[0].split("")[1],wall[0].split("")[0]);
        // MUR HORIZONTAL
        if(parseInt(wall[1])===parseInt("0")) {
            //console.log(wallPosition.row,wallPosition.col);
            let goodCoordinates = convertVellaToClassicCoordinates(wallPosition.col, wallPosition.row);
            let wallToEdit = horizontalWalls.getWall(goodCoordinates[0], goodCoordinates[1], 'H');
            let neighborOfWallToEdit;
            if(goodCoordinates[1]+1<9){
                neighborOfWallToEdit = horizontalWalls.getWall(goodCoordinates[0],goodCoordinates[1]+1, 'H');
                neighborOfWallToEdit.setPresent();
                neighborOfWallToEdit.setOwner(playOrder);
            }
            else{
                neighborOfWallToEdit = horizontalWalls.getWall(goodCoordinates[0],goodCoordinates[1]-1, 'H');
                neighborOfWallToEdit.setPresent();
                neighborOfWallToEdit.setOwner(playOrder);
            }
            wallToEdit.setPresent();
            wallToEdit.setOwner(playOrder);
        }
        //MUR VERTICAL
        else if(parseInt(wall[1])===parseInt("1")){
            //console.log("wallPosition : ",wallPosition);
            let goodCoordinates = convertVellaToClassicCoordinates(wallPosition.col,wallPosition.row);
            let wallToEdit = verticalWalls.getWall(goodCoordinates[0],goodCoordinates[1],'V');
            let neighborOfWallToEdit;
            if(goodCoordinates[0]+1<9){
                neighborOfWallToEdit = verticalWalls.getWall(goodCoordinates[0]+1,goodCoordinates[1], 'V');
                neighborOfWallToEdit.setPresent();
                neighborOfWallToEdit.setOwner(playOrder);
            }
            else{
                neighborOfWallToEdit = verticalWalls.getWall(goodCoordinates[0]-1,goodCoordinates[1], 'V');
                neighborOfWallToEdit.setPresent();
                neighborOfWallToEdit.setOwner(playOrder);
            }
            wallToEdit.setPresent();
            wallToEdit.setOwner(playOrder);
        }
    });

    //INIT DES PLAYABLE SQUARES
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            let gameBoardCase = gameState.board[i][j];
            //SI ON EST SUR LA CASE
            if(gameBoardCase === 1) {
                if(i<4) {playableSquares.addPlayableSquare(j, i, playOrder, true, parseInt("1"));}
                else if(i===4){playableSquares.addPlayableSquare(j, i, playOrder, true, parseInt("0"));}
                else if(i<=9){playableSquares.addPlayableSquare(j, i, playOrder, true, parseInt("-1"));}
            }
            //SI L'ADVERSAIRE EST SUR LA CASE
            else if(gameBoardCase === 2) {
                if(i<4) {playableSquares.addPlayableSquare(j, i, opponentPlayOrder, false, parseInt("1"));}
                else if(i===4){playableSquares.addPlayableSquare(j, i, opponentPlayOrder, false, parseInt("0"));}
                else if(i<=9){playableSquares.addPlayableSquare(j, i, opponentPlayOrder, false, parseInt("-1"));}
            }
            //SI ON VOIT LA CASE
            else if(gameBoardCase===0){
                if(i<4) {playableSquares.addPlayableSquare(j, i, null, true, parseInt("1"));}
                else if(i===4){playableSquares.addPlayableSquare(j, i, null, true, parseInt("0"));}
                else if(i<=9){playableSquares.addPlayableSquare(j, i, null, true, parseInt("-1"));}
            }
            //SINON, PAR DEFAUT, ON NE VOIT PAS LA CASE
            else {
                if (i < 4) {
                    playableSquares.addPlayableSquare(j, i, null, false, parseInt("1"));
                } else if (i === 4) {
                    playableSquares.addPlayableSquare(j, i, null, false, parseInt("0"));
                } else if (i <= 9) {
                    playableSquares.addPlayableSquare(j, i, null, false, parseInt("-1"));
                }
            }
        }
    }
    return [playableSquares,horizontalWalls,verticalWalls];
}

function main() {
    let opponentWalls = [
        ["59", 0]
    ];
    let ownWalls = [];
    let board = [
        [0, 0, 0, 0, 2, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0]
    ];
    setup(1).then((position) => {
    });
    let start = Date.now();
    nextMove({board, opponentWalls, ownWalls}).then((move) => {
        let timeTaken = Date.now() - start;
        console.log("Total time taken : " + timeTaken + " milliseconds");
    });
}


module.exports = { setup, nextMove, updateBoard, correction};
