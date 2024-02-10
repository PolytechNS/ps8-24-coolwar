const {WallDictionary} = require("../Objects/WallDictionary.js");
const {PlayableSquareDictionary} = require("../Objects/PlayableSquareDictionary.js");
const {GamePlayer} = require("../Objects/GamePlayer.js");
const {PlayerManager} = require("../Objects/PlayerManager.js");
const {Position} = require("../Objects/Position.js");

class GameModel {

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

        console.log("PLAYER ARRAY AFTER CONSTRCUCTOR"+this.player_array.players);
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

        console.log(this.player_array.players);
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
                this.horizontal_Walls.addWall(i, j);
                this.vertical_Walls.addWall(i, j);
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
       /* if(this.currentPlayer===1){this.currentPlayer=2;}
        else if(this.currentPlayer===2){this.currentPlayer=1;}
        else{}
        this.roundCounter+=1;
        console.log("After next Player : "+this.currentPlayer);
        */
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
}

module.exports = {GameModel};
