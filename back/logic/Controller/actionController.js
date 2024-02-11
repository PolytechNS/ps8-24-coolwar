const { Position } = require('../Model/Objects/Position.js');

class ActionController {
    constructor(model) {
        this.model = model;
    }

    checkCurrentPlayer(id) {
        //console.log("JOUEUR ACTUEL : "+this.model.currentPlayer);
        if (id !== this.model.currentPlayer) {
            console.log("Joueur " + id + " ne peux pas jouer !");
            return false;
        } else { return true; }
    }

    placeWall(walls) {
        //if (!this.checkCurrentPlayer(id)) { return null; }
        let wallToEdit = null;
        let wallBack = null;
        for (let i = 0; i < walls.length; i++) {
            let wall = walls.wallList[i];
            let wallInformations = wall.split("X");
            if (wallInformations[2]==='H' || wallInformations[2]==='V') {
                wallBack = this.model.getWallByCoordinates(wallInformations[2], wallInformations[0], wallInformations[1]);
                if (this.model.isLastWallOnTheLine(wallInformations[2], wallBack.position.row, wallBack.position.col)) {
                    return false;
                }
                if (wallBack.isPresent === false) {
                    wallBack.setPresent();
                    this.model.setNextPlayer();
                }
            }
            else { return false; }
        }
        return true;
    }

    characterCanBeMoved(row, col) {
        if (!this.model.isPlayerAtCoordinates(row, col)) { return true; }
    }

    moveCharacter(id, row, col) {
        if (this.checkCurrentPlayer(id)) {
            //VERIFICATION DU DEPLACEMENT
            if (!this.model.isPlayerAtCoordinates(row, col)) {
                console.log("JOUEUR DEPLACABLE !");
                //TODO: VERIFIER SI MOUVEMENT POSSIBLE (pas de sauts)
                let playerToMove = this.model.player_array.getPlayer(id);
                playerToMove.position = new Position(row, col);
                //this.model.setNextPlayer();
                return true;
            }
            else {
                console.log("JOUEUR NON DEPLACABLE !");
            }
        }
        return false;
    }
}

module.exports = { ActionController};
