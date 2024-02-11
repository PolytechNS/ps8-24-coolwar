import {Position} from "../Model/Objects/Position.js";
import {Utils} from "../../../front/js/Utils/utils.js";

export class ActionController{
    constructor(model) {
        this.model = model;
    }

    checkCurrentPlayer(id){
        //console.log("JOUEUR ACTUEL : "+this.model.currentPlayer);
        if(id!==this.model.currentPlayer){
            console.log("Joueur "+id + " ne peux pas jouer !");
            return false;
        }
        else{return true;}
    }

    placeWall(id,walls) {
        if (!this.checkCurrentPlayer(id)) {return null;}
        let wallToEdit = null;
        let wallBack = null;
        for(let i=0;i<walls.length;i++){
            let wall = walls[i];
            if (wall.classList.contains("horizontal_hitbox") || wall.classList.contains("vertical_hitbox")) {
                wallToEdit = wall.children.item(0);
                let coordinates = wallToEdit.id.split('X');
                if (wall.classList.contains("horizontal_hitbox")) {
                    //SI LE DERNIER SUR LA LIGNE
                    wallBack = this.model.getWallByCoordinates('H', coordinates[0], coordinates[1])
                    if(this.model.isLastWallOnTheLine('H',wallBack.position.row,wallBack.position.col)){
                        return false;
                    }
                } else {
                    wallBack = this.model.getWallByCoordinates('V', coordinates[0], coordinates[1]);
                    if(this.model.isLastWallOnTheLine('V',wallBack.position.row,wallBack.position.col)){
                        return false;
                    }
                }
                if (wallBack.isPresent === false) {
                    wallBack.setPresent();
                    this.model.setNextPlayer();
                }
            }
            else{return false;}
        }
        return true;
    }

    characterCanBeMoved(row,col,player_position){
        console.log(this.model.isNeighboorhoodFromPlayer(row,col,player_position));
        if(this.model.isNeighboorhoodFromPlayer(row,col,player_position)){
            if(!this.model.isPlayerAtCoordinates(row,col)){return true;}
        }
        return false;
    }


    moveCharacter(id,row,col) {
        if (this.checkCurrentPlayer(id)) {
            //VERIFICATION DU DEPLACEMENT
            if(!this.model.isPlayerAtCoordinates(row,col)){
                console.log("JOUEUR DEPLACABLE !");
                //TODO : VERIFIER SI MOUVEMENT POSSIBLE (pas de sauts)
                let playerToMove = this.model.player_array.getPlayer(id);
                playerToMove.position = new Position(row,col);
                this.model.setNextPlayer();
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

        if(wall.children.item(0).classList.contains("horizontal_wall")){
            return this.model.horizontal_Walls.getWall(parseInt(coordinates[0]),parseInt(coordinates[1])).isPresent;
        }
        if(wall.children.item(0).classList.contains("vertical_wall")){
            return this.model.vertical_Walls.getWall(parseInt(coordinates[0]),parseInt(coordinates[1])).isPresent;
        }
        else{
            console.log("AUCUN MUR TROUVE A CETTE POSITION !\n ["+coordinates[0]+"|"+coordinates[1]+"]");
            return null;}
    }

}