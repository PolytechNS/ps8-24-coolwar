const {WallDictionary} = require("../Objects/WallDictionary.js");
const {PlayableSquareDictionary} = require("../Objects/PlayableSquareDictionary.js");
const {GamePlayer} = require("../Objects/GamePlayer.js");
const {PlayerManager} = require("../Objects/PlayerManager.js");
const {Position} = require("../Objects/Position.js");
const { v4:uuidv4 } = require('uuid');


class GameModel {

    /*TODO: LAST POSITION IN EDIT
    CREATION DES JOUEURS ET NOTION DE TOUR ✅
    */
    constructor(config = {}) {
        const {
            idGame = uuidv4(),
            nbLignes = 9,
            nbColonnes = 9,
            nbPlayers = 2,
            horizontal_Walls = new WallDictionary(),
            vertical_Walls = new WallDictionary(),
            playable_squares = new PlayableSquareDictionary(),
            player_array = new PlayerManager(),
            currentPlayer = 1,
            roundCounter = 0
        } = config;

        this.idGame = uuidv4();
        this.nbLignes = 9;
        this.nbColonnes = 9;
        this.nbPlayers = 2;
        this.currentPlayer = 1;
        this.roundCounter = 1;
        this.lastChance=0;
        if(!config.horizontal_Walls){
            this.horizontal_Walls = new WallDictionary();
        }else {
            this.horizontal_Walls = horizontal_Walls;
        }
        if(!config.vertical_Walls){
            this.vertical_Walls = new WallDictionary();
        }else {
            this.vertical_Walls = vertical_Walls;
        }
        if(!config.playable_squares){
            this.playable_squares = new PlayableSquareDictionary();
            this.init_model();

        }
        else {
            this.playable_squares = playable_squares;
        }
        if(!config.player_array){
            this.player_array = new PlayerManager();
            this.initPlayers();


        }else {
            this.player_array = player_array;
        }


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
            for (let j = 0; j < nbColonnes; j++) {
                this.horizontal_Walls.addWall(i, j,'H');
                this.vertical_Walls.addWall(i, j,'V');
            }
        }
        for (let i = 0; i < nbLignes; i++) {
            for (let j = 0; j < nbColonnes; j++) {
                this.playable_squares.addPlayableSquare(i, j, null, false);
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
}

module.exports = {GameModel};
