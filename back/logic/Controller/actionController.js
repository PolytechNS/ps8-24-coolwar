const { Position } = require('../Model/Objects/Position.js');

class ActionController {
    constructor(model) {
        this.model = model;
    }

    checkCurrentPlayer(id) {
        console.log("JOUEUR ACTUEL : "+this.model.currentPlayer);
        if (id !== this.model.currentPlayer) {
            console.log("Joueur " + id + " ne peux pas jouer !");
            return false;
        } else {
            return true;
        }
    }

    placeWall(walls) {
        let wallToEdit = null;
        let wallBack = null;
        for (let i = 0; i < walls.length; i++) {
            let wall = walls[i];
            let wallInformations = wall.split("X");
            if (wallInformations[2] === 'H' || wallInformations[2] === 'V') {
                wallBack = this.model.getWallByCoordinates(wallInformations[2], wallInformations[0], wallInformations[1]);
                if (this.model.isLastWallOnTheLine(wallInformations[2], wallBack.position.row, wallBack.position.col)) {
                    return false;
                }
                if (wallBack.isPresent === false) {
                    wallBack.setPresent();
                }
            } else {
                return false;
            }
        }
        this.model.setNextPlayer();
        return true;
    }

    characterCanBeMoved(row, col, player_position) {
        //SI LA CASE EST VOISINE CARDINALEMENT
        if (this.model.isNeighboorhoodFromPlayer(row, col, player_position)) {
            //SI UN MUR NE BLOQUE PAS
            if (!this.model.isWallBlock(row, col, player_position)) {
                //SI UN JOUEUR EST DEJA DESSUS
                if (!this.model.isPlayerAtCoordinates(row, col)) {
                    return true;
                }
            }
        }
        return false;
    }

    moveCharacter(id,row,col) {
        if (this.checkCurrentPlayer(id)) {
            //VERIFICATION DU DEPLACEMENT
            let player_position = this.model.player_array.getPlayerPosition(id);
            if(this.characterCanBeMoved(row,col,player_position)){
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

    isPresentWall(wall) {
        let coordinates = Utils.prototype.getCoordinatesFromID(wall.children.item(0).id);

        if (wall.children.item(0).classList.contains("horizontal_wall")) {
            return this.model.horizontal_Walls.getWall(parseInt(coordinates[0]), parseInt(coordinates[1])).isPresent;
        }
        if (wall.children.item(0).classList.contains("vertical_wall")) {
            return this.model.vertical_Walls.getWall(parseInt(coordinates[0]), parseInt(coordinates[1])).isPresent;
        } else {
            console.log("AUCUN MUR TROUVE A CETTE POSITION !\n [" + coordinates[0] + "|" + coordinates[1] + "]");
            return null;
        }
    }


    getPlayerPosition(id){
        return this.model.player_array.getPlayerPosition(id);
    }

    updateGameInformation(){
        return [this.model.currentPlayer,this.model.roundCounter];
    }
    updateWalls(){
        return [this.model.horizontal_Walls, this.model.vertical_Walls];
    }

    checkWinner(){
        return this.model.checkWinner();
    }
}

module.exports = { ActionController};
