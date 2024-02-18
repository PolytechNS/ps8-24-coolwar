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


// ------------------- VARIABLES ----------------------------------

let finishLine = null; // trouver la ligne d'arrivée
let playOrder = null;
let graph = null; // le graph de jeu

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

        function setupIA(AIplay){
            let randomBottom = Math.round(Math.random() * 9);
            let randomTop = Math.round(Math.random() * 9);
            let position = null;
            if(AIplay === 1){
                position = randomBottom.toString()+"1";
                finishLine = parseInt("9");
            }
            else{
                position = randomTop.toString()+"9";
                finishLine = parseInt("1");
            }
            return position;
        }
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
            const res = nextMove(gameState);
            if(res!==null){resolve(res);}
            else{reject("Internal Error From IA NEXT MOVE");}
        }, 990);


    });
}

function nextMove(gameState) {
   //....
    //CHOIX --> PROCHAIN MOVE DE DJIKSTRA
    let nextMove = null;
    let graph = computeNewGraph(gameState);
    let myPosition = myPosition(gameState.board);
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
function convertVellaCooordinatesToOurs(col,row){
    return [9-parseInt(row),parseInt(col)-1];
}

function computeNewGraph(gameState) {
    let [playableSquaresFinal, horizontalWallsFinal, verticalWallsFinal] = convertGameStateToGamemodel(gameState);
    return new Graph(playableSquaresFinal, horizontalWallsFinal, verticalWallsFinal);
}

function convertGameStateToGamemodel(gameState){
    let horizontalWalls = new WallDictionary();
    let verticalWalls = new WallDictionary();
    let playableSquares = new PlayableSquareDictionary();
    for (let i = 0; i < 9; i++) {for (let j = 0; j < 9; j++) {horizontalWalls.addWall(i, j,'H',false,null,null);}}
    for (let i = 0; i < 9; i++) {for (let j = 0; j < 9; j++) {verticalWalls.addWall(i, j,'V',false,null,null);}}

    let opponentPlayOrder = playOrder === 1 ? 2 : 1;
    gameState.opponentWalls.forEach(function (wall){
        let wallPosition = new Position(wall[0].split("")[0],wall[0].split("")[1]);
        //SI MUR HORIZONTAL
        if(parseInt(wall[1])===parseInt("0")){
            let goodCoordinates = convertVellaCooordinatesToOurs(wallPosition.row,wallPosition.col);
            let wallToEdit = horizontalWalls.getWall(goodCoordinates[0],goodCoordinates[1],'H');
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
            let neighborOfWallToEdit = verticalWalls.getWall(goodCoordinates[0]-1,goodCoordinates[1], 'V');
            wallToEdit.setPresent();
            wallToEdit.setOwner(opponentPlayOrder);
            neighborOfWallToEdit.setPresent();
            neighborOfWallToEdit.setOwner(opponentPlayOrder);
        }
    });
    gameState.ownWalls.forEach(function (wall){
        let wallPosition = new Position(wall[0].split("")[0],wall[0].split("")[1]);
        if(parseInt(wall[1])===parseInt("0")) {
            let goodCoordinates = convertVellaCooordinatesToOurs(wallPosition.row, wallPosition.col);
            let wallToEdit = horizontalWalls.getWall(goodCoordinates[0], goodCoordinates[1], 'H');
            let neighborOfWallToEdit = horizontalWalls.getWall(goodCoordinates[0],goodCoordinates[1]+1, 'H');
            wallToEdit.setPresent();
            wallToEdit.setOwner(playOrder);
            neighborOfWallToEdit.setPresent();
            neighborOfWallToEdit.setOwner(playOrder);
        }
        else if(parseInt(wall[1])===parseInt("1")){
            let goodCoordinates = convertVellaCooordinatesToOurs(wallPosition.row,wallPosition.col);
            let wallToEdit = verticalWalls.getWall(goodCoordinates[0],goodCoordinates[1],'V');
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
    console.log(horizontalWalls.wallList.toString());
    console.log(verticalWalls.wallList.toString());
    return [playableSquares,horizontalWalls,verticalWalls];
}



function main(){
    let opponentWalls = [
        ["19",0],
        ["25",0],
        ["34",0]
    ];
    let ownWalls = [
        ["37",1],
        ["16",0],
        ["52",0]
    ];
    let board = [
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0]
    ];

    let start = Date.now();
    let graph = computeNewGraph({board, opponentWalls, ownWalls});
    let path = dijkstra(graph,graph.getNodeFromCoordinates(0,0),graph.getNodeFromCoordinates(8,0)).path;

    path.forEach(node => {
        console.log(node.position);
    });
    let timeTaken = Date.now() - start;


    console.log("Total time taken : " + timeTaken + " milliseconds");

   /* let gameboard = init_gameboard();
    //showGameboard(gameboard);

    setup(1).then((position) => {
        console.log(position);
        console.log(finishLine);
    }).catch((error) => {
            console.log(error);
        });
        */



    // ------------------- FONCTIONS ----------------------------------

    function init_gameboard(){
        let gameboard = [];
                for (let i = 0; i < 9; i++) {
                    let row = [];
                    for (let j = 0; j < 9; j++) {row.push(parseInt("0"));}
                    gameboard.push(row);
                }
        return gameboard.reverse();
    }
    function showGameboard(gameboard){
        gameboard.forEach(row => {
            let rowString = "";
            row.forEach(cell => {
                rowString += "|"+cell;
            });
            rowString += "|";
            console.log(rowString);
        });
    }
}

function dijkstra(graph, startNode, endNode) {
    let distances = {};
    let prev = {};
    let pq = new PriorityQueue();

    graph.nodes.forEach(node => {
        distances[node.position] = Infinity;
        prev[node.position] = null;
        pq.enqueue(node, Infinity);
    });

    distances[startNode.position] = 0;
    pq.updatePriority(startNode, 0);

    while (!pq.isEmpty()) {
        let { element: currentNode } = pq.dequeue();

        // Si nous avons atteint le nœud de destination, arrêtons l'algorithme
        if (currentNode === endNode) break;

        let neighbors = currentNode.getNeighborhood();
        neighbors.forEach(neighbor => {
            let alt = distances[currentNode.position] + 1; // Suppose un poids de 1 pour chaque arête
            if (alt < distances[neighbor.position]) {
                distances[neighbor.position] = alt;
                prev[neighbor.position] = currentNode;
                pq.updatePriority(neighbor, alt);
            }
        });
    }

    // Reconstruire le chemin le plus court de startNode à endNode
    let path = [];
    for (let at = endNode; at !== null; at = prev[at.position]) {
        path.push(at);
    }
    path.reverse(); // Le chemin est construit à l'envers, donc nous le retournons

    // Retourner le chemin et la distance
    return {
        path: path,
        distance: distances[endNode.position]
    };
}


class Graph{
    constructor(playable_squares,horizontal_walls,vertical_walls) {
        this.nodes = [];
        this.vertices = [];
        this.playable_squares = playable_squares;
        this.horizontal_walls = horizontal_walls;
        this.vertical_walls = vertical_walls;
        console.log("-------------GRAPH MODELISATION-------------");
        this.init_nodes();
        this.init_vertices();
        console.log("-------------END  MODELISATION-------------");
    }

    init_nodes(){
        //init tableau de nodes
        for(let i=0;i<this.playable_squares.playableSquares.length;i++){
            let square = this.playable_squares.playableSquares[i];
            this.nodes.push(new GraphNode(square));
        }
    }
    getNodeFromCoordinates(row,col){
        for(let i=0;i<this.nodes.length;i++){
            let node = this.nodes[i];
            if(parseInt(node.position.row)===parseInt(row) && parseInt(node.position.col)===parseInt(col)){return node;}
        }
        return null;
    }
    init_vertices() {
        for(let i=0;i<this.nodes.length;i++){
            let node = this.nodes[i];
            let wallsNeighborhood = this.getWallsNeighborhood(node.position);
            for(let j=0;j<wallsNeighborhood.length;j++){
                let wall =  wallsNeighborhood[j];
                if(!wall.isPresent){
                    let nodeToLookingFor;
                    //wall en dessous
                    if(wall.position.row === node.position.row && wall.position.col===node.position.col && wall.type==='H'){
                        nodeToLookingFor = this.getNodeFromCoordinates(wall.position.row+1,wall.position.col);
                    }
                    //wall à droite
                    else if(wall.position.row === node.position.row && wall.position.col===node.position.col && wall.type==='V'){
                        nodeToLookingFor = this.getNodeFromCoordinates(wall.position.row,wall.position.col+1);
                    }
                    //wall en haut
                    else if(wall.position.row+1 === node.position.row && wall.position.col===node.position.col){
                        nodeToLookingFor = this.getNodeFromCoordinates(wall.position.row,wall.position.col);
                    }
                    //wall en bas
                    else if(wall.position.row===node.position.row && wall.position.col+1===node.position.col){
                        nodeToLookingFor = this.getNodeFromCoordinates(wall.position.row,wall.position.col);
                    }
                    //wall de la même position que le wall
                    else{nodeToLookingFor = this.getNodeFromCoordinates(wall.position.row,wall.position.col);}
                    //console.log("ADD LINK : WALL -> ",wall, " ON NODE ",nodeToLookingFor);

                    this.vertices.push(node.addLink(wall,nodeToLookingFor));
                }
            }
        }
    }
    getWallsNeighborhood(position){
        let availableCardinalPosition = [
            [parseInt(position.row),parseInt(position.col)-1],
            [parseInt(position.row)-1,parseInt(position.col)]
        ];
        availableCardinalPosition = availableCardinalPosition.filter(position => {
            return position[0] >= 0 && position[1] >= 0 && position[0]<9 && position[1]<9;
        });

        let wallsNeighborhood = []

        //ON AJOUTE LE MUR DE DROITE QUE SI ON EST PAS SUR LE COTE
        if(position.col<8){wallsNeighborhood.push(this.vertical_walls.getWall(position.row,position.col,'V'));}
        //ON AJOUTE LE MUR D'EN BAS UNIQUEMENT SI ON EST AU MILIEU
        if(position.row<8) {wallsNeighborhood.push(this.horizontal_walls.getWall(position.row, position.col,'H'));}


        for(let i=0;i<availableCardinalPosition.length;i++){
            let tmpPosition = availableCardinalPosition[i];
            let colDiff = parseInt(tmpPosition[1]) - parseInt(position.col)
            let rowDiff = parseInt(tmpPosition[0]) - parseInt(position.row);

            if(colDiff!==0){
                wallsNeighborhood.push(this.vertical_walls.getWall(tmpPosition[0],tmpPosition[1],'V'));
            }
            else if(rowDiff!==0){
                wallsNeighborhood.push(this.horizontal_walls.getWall(tmpPosition[0],tmpPosition[1],'H'));
            }
        }
        return wallsNeighborhood;
    }


}
class GraphNode {
    constructor(position) {
        this.position = position.position;
        this.upLink = null;
        this.downLink = null;
        this.leftLink = null;
        this.rightLink = null;
    }
    addLink(wall,nodeToAdd){
        let verticesToReturn = null;
        //UPLINK OU DOWNLINK
        if(wall.type==='H'){
            //DOWNLINK
            if(wall.position.col === this.position.col && wall.position.row===this.position.row){
                //console.log("DOWNLINK");
                verticesToReturn = new GraphVertices(this,nodeToAdd);
                this.downLink = verticesToReturn;
            }
            //UPLINK
            if(wall.position.col === this.position.col && wall.position.row+1 === this.position.row){
                //console.log("UPLINK");
                verticesToReturn = new GraphVertices(this,nodeToAdd);
                this.upLink = verticesToReturn;
            }
        }
        //LEFTLINK OU RIGHTLINK
        if(wall.type==='V'){
            //RIGHT LINK
            if(wall.position.col === this.position.col && wall.position.row===this.position.row){
                //console.log("RIGHTLINK");
                verticesToReturn = new GraphVertices(this,nodeToAdd);
                this.rightLink = verticesToReturn;
            }
            //LEFT LINK
            if(wall.position.col+1 === this.position.col && wall.position.row===this.position.row ){
                //console.log("LEFTLINK");
                verticesToReturn = new GraphVertices(this,nodeToAdd);
                this.leftLink = verticesToReturn;
            }
        }
        return verticesToReturn;
    }

    getNeighborhood(){
        let neighborhood = [];
        if(this.upLink!==null){neighborhood.push(this.upLink.destinationNode);}
        if(this.downLink!==null){neighborhood.push(this.downLink.destinationNode);}
        if(this.leftLink!==null){neighborhood.push(this.leftLink.destinationNode);}
        if(this.rightLink!==null){neighborhood.push(this.rightLink.destinationNode);}
        return neighborhood;
    }
}
class GraphVertices{
    constructor(parentNode,destinationNode) {
        this.parentNode = parentNode;
        this.destinationNode = destinationNode;
    }

    getDestination(){
        return " --> "+this.destinationNode.position;
    }
}
class Wall{
    constructor(row,col,isPresent,type,owner,wallGroup) {
        this.position = new Position(row,col);
        this.isPresent = isPresent;
        this.type = type;
        this.idPlayer = owner;
        this.wallGroup = wallGroup;
    }

    setWallGroup(wallGroup){this.wallGroup = wallGroup;}

    equals(row,col,type){
        return this.position.row.toString() === row.toString() && this.position.col.toString() === col.toString() && this.type===type ;
    }

    setPresent(){this.isPresent = true;}

    setOwner(playerId){
        this.idPlayer = playerId;
    }

    toString(){
        return "WALL : "+this.position.toString()+" - "+this.isPresent+" - "+this.type+" - "+this.idPlayer+" - "+this.wallGroup;
    }
}
class Position {
    constructor(row, col) {
        this.row = parseInt(row);
        this.col = parseInt(col);
    }

    toString() {
        return "row:" + this.row + "/col:" + this.col + "\n";
    }
}
class WallDictionary{
    constructor() {
        this.wallList = [];
    }

    addWall(row,col,type,isPresent,owner,wallGroup){
        this.wallList.push(new Wall(row,col,isPresent,type,owner,wallGroup));
    }

    getWall(row,col,type){
        let wallToReturn=null;
        this.wallList.forEach(function (wall){
            if(wall.equals(row,col,type)){wallToReturn=wall;}
        });
        return wallToReturn;
    }
}
class PlayableSquareDictionary{
    constructor() {
        this.playableSquares = [];
    }

    addPlayableSquare(row,col,player,isVisible,visibility){
        this.playableSquares.push(new PlayableSquare(row,col,player,isVisible,parseInt(visibility)));
    }

    getAllPlayableSquares(){
        return this.playableSquares;
    }
    toString(){
        let result;
        this.playableSquares.forEach(function (PS){result += PS.toString()+"\n";});
        result += "\n";
        return result;
    }
}
class PlayableSquare{
    constructor(row,col,player,isVisible,visibility) {
        this.position = new Position(row,col);
        this.player = player;
        this.isVisible = isVisible;
        this.playerId = null;
        this.visibility = visibility;
    }

    toString(){
        return this.position.toString() + "|GamePlayer: "+this.player;
    }
}
class PriorityQueue {
    constructor() {
        this.items = [];
    }

    enqueue(element, priority) {
        let contain = false;
        const queueElement = { element, priority };

        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].priority > queueElement.priority) {
                this.items.splice(i, 0, queueElement);
                contain = true;
                break;
            }
        }

        if (!contain) {
            this.items.push(queueElement);
        }
    }

    updatePriority(element, newPriority) {
        // Trouver l'élément dans la file d'attente
        let found = false;
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].element === element) {
                // Element trouvé, retirer de la file d'attente
                this.items.splice(i, 1);
                found = true;
                break;
            }
        }

        // Si l'élément a été trouvé, l'ajouter à nouveau avec la nouvelle priorité
        if (found) {
            this.enqueue(element, newPriority);
        } else {
            console.log('Element not found in priority queue.');
        }
    }

    dequeue() {
        if (this.isEmpty())
            return 'Underflow';
        return this.items.shift();
    }

    isEmpty() {
        return this.items.length === 0;
    }

    front() {
        if (this.isEmpty())
            return 'No elements in Queue';
        return this.items[0];
    }

    rear() {
        if (this.isEmpty())
            return 'No elements in Queue';
        return this.items[this.items.length - 1];
    }

    clear() {
        this.items = [];
    }

    size() {
        return this.items.length;
    }
}


main()