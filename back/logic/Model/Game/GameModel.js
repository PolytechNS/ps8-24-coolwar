const {WallDictionary} = require("../Objects/WallDictionary.js");
const {PlayableSquareDictionary} = require("../Objects/PlayableSquareDictionary.js");
const {GamePlayer} = require("../Objects/GamePlayer.js");
const {PlayerManager} = require("../Objects/PlayerManager.js");
const {Position} = require("../Objects/Position.js");
const { v4:uuidv4 } = require('uuid');
const {Graph} = require("../Graph/Graph.js");


class GameModel {

    /*TODO: LAST POSITION IN EDIT
    CREATION DES JOUEURS ET NOTION DE TOUR ✅
    */
    constructor(config = {}) {
        console.log("CONFIG : ");
        this.idGame = uuidv4();
        this.nbLignes = 9;
        this.nbColonnes = 9;
        this.nbPlayers = 2;
        this.lastChance=0;
        if(!config.horizontal_Walls){
            this.horizontal_Walls = new WallDictionary();
            console.log("j'instancie de nouveaux walls !");
        }else {
            console.log("je charge des nouveaux walls !");

            this.horizontal_Walls = new WallDictionary();
            config.horizontal_Walls.forEach(wall => {
                console.log("WALL : "+wall.position.row+"|"+wall.position.col+"|"+wall.type+"|"+wall.isPresent);
                this.horizontal_Walls.addWallWithType(wall.position.row, wall.position.col, wall.type, wall.isPresent);
            });
        }
        if(!config.vertical_Walls){
            this.vertical_Walls = new WallDictionary();
        }else {
            this.vertical_Walls = new WallDictionary();
            config.vertical_Walls.forEach(wall => {

                this.vertical_Walls.addWallWithType(wall.position.row, wall.position.col, wall.type, wall.isPresent);
            });
        }
        if(!config.playable_squares){
            this.playable_squares = new PlayableSquareDictionary();
            this.init_model();

        }
        else {
            this.playable_squares = new PlayableSquareDictionary();
            config.playable_squares.forEach(square => {
                this.playable_squares.addPlayableSquare(square.position.row, square.position.col, square.player, square.isPlayable,square.visibility);
            });
        }
        if(!config.player_array){
            this.player_array = new PlayerManager();
            this.initPlayers();
        }else {
            this.player_array = config.player_array;
            this.player_array = new PlayerManager();
            this.player_array.createPlayFromArray(config.player_array);
        }

        if(!config.currentPlayer){
            this.currentPlayer = 1;
        }
        else {
            this.currentPlayer = config.currentPlayer;
        }
        if(!config.roundCounter){
            this.roundCounter = 0;
        }
        else {
            this.roundCounter = config.roundCounter;
        }
        if(!config.winner){
            this.winner = -1;

        }
        else{
            this.winner = config.winner;
        }
        this.graph = new Graph(this.playable_squares,this.horizontal_Walls,this.vertical_Walls);
        this.wallGroup = [];

        //COMPUTE SQUARES
        this.computeSquaresVisibility();
    }

    initPlayers(){
        let index1 = this.generateRandom(0,this.nbColonnes);
        let index2 = this.generateRandom(0,this.nbColonnes);
        if(this.generateRandom(0,1)===0){
            this.player_array.addPlayer(new GamePlayer("Player1",new Position(0,index1)));
            this.player_array.addPlayer(new GamePlayer("Player2",new Position(this.nbLignes-1,index2)));
        }
        else{
            this.player_array.addPlayer(new GamePlayer("Player1",new Position(0,index2)));
            this.player_array.addPlayer(new GamePlayer("Player2",new Position(this.nbLignes-1,index1)));
        }
    }

    generateRandom(min, max) {
        // find diff
        let difference = max - min;
        // generate random number
        let rand = Math.random();
        // multiply with difference
        rand = Math.floor( rand * difference);
        // add with min value
        rand = rand + min;
        return rand;
    }

    // Autres méthodes liées à la logique métier comme la gestion des murs, la vérification de victoire, etc.


     init_model() {
        var nbLignes = this.nbLignes;
        var nbColonnes = this.nbColonnes;
        for (let i = 0; i < nbLignes; i++) {
            for (let j = 0; j < nbColonnes; j++) {this.horizontal_Walls.addWall(i, j,'H');}
        }

         for (let i = 0; i < nbLignes; i++) {
             for (let j = 0; j < nbColonnes-1; j++) {this.vertical_Walls.addWall(i, j,'V');}
         }

        for (let i = 0; i < nbLignes; i++) {
            for (let j = 0; j < nbColonnes; j++) {
                if(i<4) {this.playable_squares.addPlayableSquare(i, j, null, false, parseInt("-1"));}
                else if(i===4){this.playable_squares.addPlayableSquare(i, j, null, false, parseInt("0"));}
                else if(i<=9){this.playable_squares.addPlayableSquare(i, j, null, false, parseInt("1"));}
            }
        }
    }

    getWallByCoordinates(type,row,col){
        if(type==='H'){return this.horizontal_Walls.getWall(row,col,type);}
        else if(type==='V'){return this.vertical_Walls.getWall(row,col,type);}
        else{return null;}
    }

    setNextPlayer(){
        if(this.currentPlayer===1){this.currentPlayer=2;}
        else if(this.currentPlayer===2){this.currentPlayer=1;}
        else{}
        this.roundCounter+=1;
        this.graph = new Graph(this.playable_squares,this.horizontal_Walls,this.vertical_Walls);
    }

    isPlayerAtCoordinates(row,col){
        return this.player_array.playerAlreadyOnPosition(row,col);
    }

    isLastWallOnTheLine(type,row,col){
        let wallsOnLine;
        if(type==='H'){wallsOnLine = this.horizontal_Walls.getLineOnX(row);}
        else if(type==='V'){wallsOnLine = this.vertical_Walls.getLineOnY(col);}
        let occupied = 0;
        for(let i=0;i<wallsOnLine.length;i++){
            let wall = wallsOnLine[i];
            if(wall.isPresent){occupied++;}
        }
        return occupied >= this.nbColonnes-1;
    }

    isNeighboorhoodFromPlayer(row, col, player_position) {
        let availableMovesPosition = [
            [parseInt(player_position.row),parseInt(player_position.col)+1],
            [parseInt(player_position.row),parseInt(player_position.col)-1],
            [parseInt(player_position.row)+1,parseInt(player_position.col)],
            [parseInt(player_position.row)-1,parseInt(player_position.col)]
        ];
        availableMovesPosition = availableMovesPosition.filter(position => {
            return position[0] >= 0 && position[1] >= 0 && position[0]<9 && position[1]<9;
        });

        console.log("CASES VOISINES DE :"+row+"|"+col+" => "+availableMovesPosition);

        for(let i=0;i<availableMovesPosition.length;i++){
            let position = availableMovesPosition[i];
            if(position[0]===parseInt(row) && position[1]===parseInt(col)){return true;}
        }
        return false;
    }

    //COORDONNEES BONNES EN ENTREE
    isWallBlock(row,col,player_position){
        let rowDiff = parseInt(row)-parseInt(player_position.row);
        let colDiff = parseInt(col)-parseInt(player_position.col);
        let wallToAnalys=null;
        //LA CASE EST AU-DESSUS DU PERSONNAGE
        if(rowDiff<0){
            console.log("CASE AU DESSUS");
            wallToAnalys = this.horizontal_Walls.getWall(row,col,'H');
        }
        //LA CASE EST EN-DESSOUS DU PERSONNAGE
        else if(rowDiff>0){
            console.log("CASE DU DESSOUS !");
            wallToAnalys = this.horizontal_Walls.getWall(player_position.row,player_position.col,'H');
        }
        //LA CASE EST A GAUCHE
        if(colDiff<0){
            console.log("CASE A GAUCHE");
            wallToAnalys = this.vertical_Walls.getWall(row,col,'V');
        }
        //LA CASE EST A DROITE
        else if(colDiff>0){
            console.log("CASE A DROITE");
            wallToAnalys = this.vertical_Walls.getWall(player_position.row,player_position.col,'V');
        }
        console.log("WALL FIND : "+wallToAnalys.position.row+"|"+wallToAnalys.position.col+"|"+wallToAnalys.isPresent);
        return wallToAnalys.isPresent;
    }

    checkWinner(){
        let valueToReturn = -1;
        if(this.roundCounter>=200){console.log("STOP GAME !");valueToReturn = 0;}
        else{

            let p1 = this.player_array.getPlayerPosition(1);
            let p2 = this.player_array.getPlayerPosition(2);

            console.log(p1.row);
            console.log(p2.row);

            //APRES LE DERNIER COUP DE B
            if(this.lastChance>0){
                //SI B N'A PAS REUSSI A AVANCER
                if(p2.row!==0){valueToReturn= 1;}
                else{valueToReturn = 0;}
            }
            //SI B EST SUR 0 EN PREMIER
            else if(p2.row===0){valueToReturn=2;}
            //si A est sur la derniere ligne en premier
            else if(p1.row===8 && p2.row!==0){this.lastChance++;}
        }
        this.winner = valueToReturn;
        return valueToReturn;
    }

    //RECEPTION -> wall du back
    isCuttingWallGroup(backInformations){
        console.log("----------IS CUTTING WALL GROUP-----------");
        let neighborhoodList = [];
        let wallBackList = [];
        for(let i=0;i<backInformations.wallList.length;i++){
            let wallToEdit = backInformations.wallList[i];
            let wallInformations = wallToEdit.split("X");
            let wallBack=null;
            if(wallInformations[2]==='H'){
                wallBackList.push(this.getWallByCoordinates('H',wallInformations[0],wallInformations[1]));
            }
            else if(wallInformations[2]==='V'){
                wallBackList.push(this.getWallByCoordinates('V',wallInformations[0],wallInformations[1]));
            }
            neighborhoodList.push(this.getWallNeighborhood(wallBackList[i]));
        }

        let wallToRead = backInformations.wallList[0];
        let wallInformations = wallToRead.split("X");

        //SI LA SELECTION EST UN ENSEMBLE DE MURS HORIZONTAUX
        if(wallInformations[2]==='H'){
            console.log("SELECTION HORIZONTALE");

            //SI TOUS LES ELEMENTS DE COMPARAISON EXISTENT
            if(neighborhoodList[0].upRight!==null && neighborhoodList[1].upLeft!==null && neighborhoodList[0].downRight !==null && neighborhoodList[1].downLeft !=null){
                if(neighborhoodList[0].upRight.wallGroup!==null && neighborhoodList[1].upLeft.wallGroup!==null && neighborhoodList[0].downRight.wallGroup!==null && neighborhoodList[1].downLeft.wallGroup!==null){
                    if(neighborhoodList[0].upRight.wallGroup === neighborhoodList[1].upLeft.wallGroup && neighborhoodList[0].downRight.wallGroup === neighborhoodList[1].downLeft.wallGroup){
                        return true;
                    }
                }
            }
        }
        if(wallInformations[2]==='V'){
            if(neighborhoodList[0].downLeft!==null && neighborhoodList[1].upLeft!==null && neighborhoodList[0].downRight !==null && neighborhoodList[1].upRight !=null){
                if(neighborhoodList[0].downLeft.wallGroup!==null && neighborhoodList[1].upLeft.wallGroup!==null && neighborhoodList[0].downRight.wallGroup!==null && neighborhoodList[1].upRight.wallGroup!==null){
                    if(neighborhoodList[0].downLeft.wallGroup === neighborhoodList[1].upLeft.wallGroup && neighborhoodList[0].downRight.wallGroup === neighborhoodList[1].upRight.wallGroup){
                        return true;
                    }
                }
            }
        }
    }

    getWallNeighborhood(wall){
        let wallsNeighborhood = {
            upLeft: null,
            upRight: null,
            downLeft: null,
            downRight: null
        }
        if(wall.type==='H'){
                //EXTREMITE GAUCHE DE MAP
                if(wall.position.col === 0){
                    wallsNeighborhood.upRight = this.getWallByCoordinates('V',wall.position.row,wall.position.col);
                    wallsNeighborhood.downRight = this.getWallByCoordinates('V',wall.position.row+1,wall.position.col);
                }
                //EXTREMITE DROITE DE MAP
                else if(wall.position.col === 8){
                    wallsNeighborhood.upLeft = this.getWallByCoordinates('V',wall.position.row,wall.position.col-1);
                    wallsNeighborhood.downLeft = this.getWallByCoordinates('V',wall.position.row+1,wall.position.col-1);
                }
                //AU MILIEU
                else{
                    wallsNeighborhood.upLeft = this.getWallByCoordinates('V',wall.position.row,wall.position.col-1);
                    wallsNeighborhood.upRight = this.getWallByCoordinates('V',wall.position.row,wall.position.col);
                    wallsNeighborhood.downLeft = this.getWallByCoordinates('V',wall.position.row+1,wall.position.col-1);
                    wallsNeighborhood.downRight = this.getWallByCoordinates('V',wall.position.row+1,wall.position.col);
                }
        }
        if(wall.type==='V'){
            //EXTREMITE GAUCHE DE MAP
            if(wall.position.row === 0){
                wallsNeighborhood.downLeft = this.getWallByCoordinates('H',wall.position.row,wall.position.col);
                wallsNeighborhood.downRight = this.getWallByCoordinates('H',wall.position.row,wall.position.col+1);
            }
            else if(wall.position.row >= 8){
                wallsNeighborhood.upLeft = this.getWallByCoordinates('H',wall.position.row-1,wall.position.col);
                wallsNeighborhood.upRight = this.getWallByCoordinates('H',wall.position.row-1,wall.position.col+1);
            }
            //AU MILIEU
            else {
                wallsNeighborhood.upLeft = this.getWallByCoordinates('H', wall.position.row - 1, wall.position.col);
                wallsNeighborhood.upRight = this.getWallByCoordinates('H', wall.position.row - 1, wall.position.col + 1);
                wallsNeighborhood.downLeft = this.getWallByCoordinates('H',wall.position.row,wall.position.col);
                wallsNeighborhood.downRight = this.getWallByCoordinates('H', wall.position.row, wall.position.col + 1);
            }
        }
        return wallsNeighborhood;
    }


    computeSquaresVisibility(){
        console.log("COMPUTE VISIBILITY");
        //POSITION DES JOUEURS
        for(let i=0;i<this.player_array.players.length;i++){
            let position = this.player_array.players[i].position;
            let cardinalSquares = this.playable_squares.getCardinalSquares(position.row,position.col);
            console.log(cardinalSquares);
            for(let j=0;j<cardinalSquares.length;j++){
                let caseToEdit = this.playable_squares.getPlayableSquare(cardinalSquares[j][0],cardinalSquares[j][1]);
                console.log(caseToEdit);
                if(i===0){caseToEdit.visibility += -1;}
                if(i===1){caseToEdit.visibility += 1;}
            }
        }
        this.playable_squares.playableSquares.forEach(square=>{
           console.log("SQUARE: ",square.position," | ",square.visibility);
        });
    }
}

module.exports = {GameModel};
