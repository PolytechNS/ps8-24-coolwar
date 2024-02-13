import {WallDictionary} from "../Objects/WallDictionary.js";
import {PlayableSquareDictionary} from "../Objects/PlayableSquareDictionary.js";
import {PlayerManager} from "../Objects/PlayerManager.js";
import {GamePlayer} from "../Objects/GamePlayer.js";
import {Position} from "../Objects/Position.js";
import {Graph} from "../Graph/Graph.js";

export class GameModel {

    /*TODO: LAST POSITION IN EDIT
    CREATION DES JOUEURS ET NOTION DE TOUR ✅
    */
    constructor() {
        this.nbLignes = 9;
        this.nbColonnes = 9;
        this.nbPlayers = 2;
        this.horizontal_Walls = new WallDictionary();
        this.vertical_Walls = new WallDictionary();
        this.playable_squares = new PlayableSquareDictionary();
        this.player_array = new PlayerManager();
        //INITIALISATION DES JOUEURS
        this.initPlayers();
        //INIT DU MODEL
        this.init_model();
        this.currentPlayer = 1;
        this.roundCounter = 0;
        this.winner = null;
        this.lastChance = 0;
        this.graph = new Graph(this.playable_squares,this.horizontal_Walls,this.vertical_Walls);
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
            }
        }
         for (let i = 0; i < nbLignes; i++) {
             for (let j = 0; j < nbColonnes-1; j++) {
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
        if(type==='H'){return this.horizontal_Walls.getWall(row,col);}
        else if(type==='V'){return this.vertical_Walls.getWall(row,col);}
        else{return null;}
    }

    setNextPlayer(){
        if(this.currentPlayer===1){this.currentPlayer=2;}
        else if(this.currentPlayer===2){this.currentPlayer=1;}
        else{}
        this.roundCounter+=1;
        this.graph = new Graph(this.playable_squares,this.horizontal_Walls,this.vertical_Walls);
        console.log("After next Player : "+this.currentPlayer);
    }

    isPlayerAtCoordinates(row,col){
        return this.player_array.playerAlreadyOnPosition(row,col);
    }

    isLastWallOnTheLine(type,row,col){
        let wallsOnLine;
        if(type==='H'){
            wallsOnLine = this.horizontal_Walls.getLineOnX(row);
        }
        else if(type==='V'){
            wallsOnLine = this.vertical_Walls.getLineOnY(col);
        }
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

        console.log(rowDiff+"|"+colDiff);

        let wallToAnalys=null;
        //LA CASE EST AU-DESSUS DU PERSONNAGE
        if(rowDiff<0){wallToAnalys = this.horizontal_Walls.getWall(row,col);}
        //LA CASE EST EN-DESSOUS DU PERSONNAGE
        else if(rowDiff>0){
            console.log("CASE DU DESSOUS !");
            wallToAnalys = this.horizontal_Walls.getWall(player_position.row,player_position.col);
            console.log("wall: "+wallToAnalys.isPresent);
        }
        else{
            //LA CASE EST A GAUCHE
            if(colDiff<0){wallToAnalys = this.vertical_Walls.getWall(row,col);}
            if(colDiff>0){wallToAnalys = this.vertical_Walls.getWall(player_position.row,player_position.col);}
        }
        console.log(wallToAnalys.isPresent);
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
