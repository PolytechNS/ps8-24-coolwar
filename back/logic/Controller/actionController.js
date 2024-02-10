import {Position} from "../Model/Objects/Position.js";
import {Utils} from "../../../front/js/Utils/utils.js";

export class ActionController{
    constructor(model) {
        this.model = model;
    }

    checkCurrentPlayer(id){
        console.log("JOUEUR ACTUEL : "+this.model.currentPlayer);
        if(id!==this.model.currentPlayer){
            console.log("Joueur "+id + " ne peux pas jouer !");
            return false;
        }
        else{return true;}
    }

    placeWall(id,walls) {
        console.log("PLACEWALL");
        if (!this.checkCurrentPlayer(id)) {return null;}
        let wallToEdit = null;
        let wallBack = null;
        for(let i=0;i<walls.length;i++){
            let wall = walls[i];
            if (wall.classList.contains("horizontal_hitbox") || wall.classList.contains("vertical_hitbox")) {
                wallToEdit = wall.children.item(0);
                let coordinates = wallToEdit.id.split('X');
                if (wall.classList.contains("horizontal_hitbox")) {
                    wallBack = this.model.getWallByCoordinates('H', coordinates[0], coordinates[1]);
                } else {
                    wallBack = this.model.getWallByCoordinates('V', coordinates[0], coordinates[1]);
                }
                if (wallBack.isPresent === false) {
                    wallBack.setPresent();
                    console.log(wallBack);
                    this.model.setNextPlayer();
                }
            }
            else{return false;}
        }
        return true;
    }

    characterCanBeMoved(x,y){
        if(!this.model.isPlayerAtCoordinates(x,y)){return true;}
    }
    moveCharacter(id,x,y) {
        if (this.checkCurrentPlayer(id)) {
            //VERIFICATION DU DEPLACEMENT
            if(!this.model.isPlayerAtCoordinates(x,y)){
                console.log("JOUEUR DEPLACABLE !");
                //TODO : VERIFIER SI MOUVEMENT POSSIBLE (pas de sauts)
                let playerToMove = this.model.player_array.players.get(id);
                playerToMove.position = new Position(x,y);
                //this.model.setNextPlayer();
                console.log(this.model.currentPlayer);
                return true;
            }
            else{
                console.log("JOUEUR NON DEPLACABLE !");
            }
        }
        return false;
    }

    isPresentWall(wall){
        let coordinates = Utils.prototype.getCoordinatesFromID(wall.children.item(0).id);

        console.log("IS PRESENT LOGS");
        if(wall.children.item(0).classList.contains("horizontal_wall")){
            console.log("IS OCCUPIED AT THIS POSITION :"+"["+coordinates[0]+"|"+coordinates[1]+"] ?");
            console.log(this.model.horizontal_Walls.getWall(parseInt(coordinates[0]),parseInt(coordinates[1])).isPresent);
            return this.model.horizontal_Walls.getWall(parseInt(coordinates[0]),parseInt(coordinates[1])).isPresent;
        }
        if(wall.children.item(0).classList.contains("vertical_wall")){
            console.log("IS OCCUPIED AT THIS POSITION :"+"["+coordinates[0]+"|"+coordinates[1]+"] ?");
            console.log(this.model.vertical_Walls.getWall(parseInt(coordinates[0]),parseInt(coordinates[1])).isPresent);
            return this.model.vertical_Walls.getWall(parseInt(coordinates[0]),parseInt(coordinates[1])).isPresent;
        }
        else{
            console.log("AUCUN MUR TROUVE A CETTE POSITION !\n ["+coordinates[0]+"|"+coordinates[1]+"]");
            return null;}
    }

}