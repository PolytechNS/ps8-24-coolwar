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

    placeWall(walls,playerID) {
        console.log("WHO PLAY ?",playerID);
        if (!this.checkCurrentPlayer(playerID)) {return false;}
        let wallToEdit = null;
        let wallBack = null;

        let wallGroupId = this.getRandomArbitrary(0,60);

        //VERIFIE QU'IL Y A TOUJOURS UN ID DE GROUPE DE MUR DISPONIBLE
        while(this.model.wallGroup.includes(wallGroupId)){wallGroupId = this.getRandomArbitrary(0,60);}

        //VERIFIE QUE LES MURS NE COUPENT PAS UN GROUPE DE MURS
        if(this.model.isCuttingWallGroup(walls)){console.log("COUPAGE ENTRE MURS !");return false;}
        console.log("REMAINING WALL",this.model.player_array.getPlayer(playerID).getRemainingWalls());
        if(this.model.player_array.getPlayer(playerID).getRemainingWalls()<=0){console.log("PAS DE MURS DISPONIBLES !");return false;}

        for (let i = 0; i < walls.wallList.length; i++) {
            let wall = walls.wallList[i];
            let wallInformations = wall.split("X");
            if (wallInformations[2] === 'H' || wallInformations[2] === 'V') {
                wallBack = this.model.getWallByCoordinates(wallInformations[2], wallInformations[0], wallInformations[1]);
                if (this.model.isLastWallOnTheLine(wallInformations[2], wallBack.position.row, wallBack.position.col)) {return false;}
                if (wallBack.isPresent === false) {
                    console.log("MUR PLACABLE !");
                    wallBack.setOwner(this.model.currentPlayer);
                    wallBack.setPresent();
                    wallBack.setWallGroup(wallGroupId);
                    this.model.wallGroup.push(wallGroupId);
                }
            } else {return false;}
        }
        this.model.player_array.getPlayer(this.model.currentPlayer).minusWall();
        this.model.setNextPlayer();
        return true;
    }

    characterCanBeMoved(row,col,player_position){
        //SI LA CASE EST VOISINE CARDINALEMENT
        if(this.model.isNeighboorhoodFromPlayer(row,col,player_position)){
            //SI UN MUR NE BLOQUE PAS
            if(!this.model.isWallBlock(row,col,player_position)){
                //SI UN JOUEUR EST DEJA DESSUS
                if(!this.model.isPlayerAtCoordinates(row,col)){return true;}
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
                this.model.resetSquaresVisibility();
                //TODO : VERIFIER SI MOUVEMENT POSSIBLE (pas de sauts)
                let playerToMove = this.model.player_array.getPlayer(id);
                playerToMove.position = new Position(row,col);
                this.model.setNextPlayer();
                return true;
            }
            else{console.log("JOUEUR NON DEPLACABLE !");}
        }
        return false;
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

    getRandomArbitrary(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }
    checkWinner(){
        return this.model.checkWinner();
    }

}

module.exports = { ActionController};
