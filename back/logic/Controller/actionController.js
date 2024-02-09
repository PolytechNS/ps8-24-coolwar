import {Position} from "../Model/Objects/Position.js";

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
        if (!this.checkCurrentPlayer(id)) {return null;}
        let wallToEdit = null;
        let wallBack = null;

        for(let i=0;i<walls.size;i++){
            let wall = walls.item(i);
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
                this.model.setNextPlayer();
                console.log(this.model.currentPlayer);
                return true;
            }
            else{
                console.log("JOUEUR NON DEPLACABLE !");
            }
        }
        return false;
    }

}