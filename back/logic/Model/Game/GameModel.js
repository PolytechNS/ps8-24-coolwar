import {WallDictionary} from "../Objects/WallDictionary.js";
import {PlayableSquareDictionary} from "../Objects/PlayableSquareDictionary.js";
import {PlayerManager} from "../Objects/PlayerManager.js";
import {GamePlayer} from "../Objects/GamePlayer.js";
import {Position} from "../Objects/Position.js";

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
        //INIT GRILLE
        this.grid = this.createInitialGrid(this.nbColonnes, this.nbLignes); // Pour une grille 9x9
        //INITIALISATION DES JOUEURS
        this.initPlayers();
        //INIT DU MODEL
        this.init_model();
        this.currentPlayer = 1;
    }
    initPlayers(){
        for(let i=0;i<this.nbPlayers;i++){
            let position = this.generateRandomPosition();
            while(this.player_array.playerAlreadyOnPosition(position)){position = this.generateRandomPosition();}
            this.player_array.addPlayer(new GamePlayer("Player"+i,this.generateRandomPosition()));

            console.log("NEW PLAYER !");
            console.log(this.player_array.players.get(i+1));
        }
    }

    generateRandomPosition() {
        const max = this.nbColonnes;
        const min = 0;
        return new Position(this.generateRandom(min,max),this.generateRandom(min,max));
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

    createInitialGrid(rows, cols) {
        let grid = [];
        for (let i = 0; i < rows; i++) {
            let row = [];
            for (let j = 0; j < cols; j++) {
                row.push({}); // Remplacer par l'objet cellule approprié
            }
            grid.push(row);
        }
        return grid;
    }

    // Autres méthodes liées à la logique métier comme la gestion des murs, la vérification de victoire, etc.


     init_model() {
        var nbLignes = this.nbLignes;
        var nbColonnes = this.nbColonnes;

        for (let i = 0; i < nbLignes - 1; i++) {
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

    getWallByCoordinates(type,x,y){
        if(type==='H'){return this.horizontal_Walls.getWall(x,y);}
        else if(type==='V'){return this.vertical_Walls.getWall(x,y);}
        else{return null;}
    }

    setNextPlayer(){
        if(this.currentPlayer===1){this.currentPlayer=2;}
        else if(this.currentPlayer===2){this.currentPlayer=1;}
        else{}
        console.log("After next Player : "+this.currentPlayer);
    }

    isPlayerAtCoordinates(x,y){
        return this.player_array.playerAlreadyOnPosition(x,y);
    }
}
