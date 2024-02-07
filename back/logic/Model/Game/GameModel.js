import {WallDictionary} from "../Objects/WallDictionary.js";
import {PlayableSquareDictionary} from "../Objects/PlayableSquareDictionary.js";
import {PlayerManager} from "../Objects/PlayerManager.js";
import {GamePlayer} from "../Objects/GamePlayer.js";
import {Position} from "../Objects/Position.js";

const horizontal_Walls = new WallDictionary();
const vertical_Walls = new WallDictionary();
const playable_squares = new PlayableSquareDictionary();
const players = new PlayerManager();

export class GameModel {

    /*TODO: LAST POSITION IN EDIT
    CREATION DES JOUEURS ET NOTION DE TOUR ✅
    */
    constructor(view) {
        //INIT GRILLE
        this.grid = this.createInitialGrid(view.nbColonnes, view.nbLignes); // Pour une grille 9x9
        //INITIALISATION DES JOUEURS
        this.initPlayers();
        //INIT DU MODEL
        this.init_model(view);
        this.view = view;
        this.currentPlayer = 1;
    }
    initPlayers(){
        for(let i=0;i<this.view.nbPlayers;i++){
            let position = this.generateRandomPosition();
            while(players.playerAlreadyOnPosition(position)){position = this.generateRandomPosition();}
            players.addPlayer(new GamePlayer("Player"+i,this.generateRandomPosition()));
        }
    }

    generateRandomPosition() {
        const max = this.view.nbColonnes
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

    moveCharacter(direction) {
        // Logique pour déplacer le personnage
        // Mettez à jour this.playerPosition et this.grid en conséquence
        // Ici, vous pouvez implémenter les détails de la logique de déplacement,
        // par exemple vérifier les collisions, les murs, etc.

        // Après le mouvement, renvoyez la nouvelle grille.
        return Promise.resolve(this.grid); // Simule une opération asynchrone
    }

    // Autres méthodes liées à la logique métier comme la gestion des murs, la vérification de victoire, etc.


     init_model(view) {
        var nbLignes = view.nbLignes;
        var nbColonnes = view.nbColonnes;

        for (let i = 0; i < nbLignes - 1; i++) {
            for (let j = 0; j < nbColonnes; j++) {
                horizontal_Walls.addWall(i, j);
                vertical_Walls.addWall(i, j);
            }
        }
        for (let i = 0; i < nbLignes; i++) {
            for (let j = 0; j < nbColonnes; j++) {
                playable_squares.addPlayableSquare(i, j, null, false);
            }
        }
    }

    getWallByCoordinates(type,x,y){
        if(type==='H'){return horizontal_Walls.getWall(x,y);}
        else if(type==='V'){return vertical_Walls.getWall(x,y);}
        else{return null;}
    }

    setNextPlayer(){
        if(this.currentPlayer===1){this.currentPlayer=2;}
        else if(this.currentPlayer===2){this.currentPlayer=1;}
        else{}
        console.log(this.currentPlayer);
    }
}
