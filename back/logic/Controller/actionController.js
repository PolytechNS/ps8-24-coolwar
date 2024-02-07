export class ActionController{
    constructor(model) {
        this.model = model;
    }

    checkCurrentPlayer(id){
        if(id!==this.model.currentPlayer){
            console.log("Joueur "+id + " ne peux pas jouer !");
            return false;
        }
        else{return true;}
    }

    placeWall(id,wall) {
        if (!this.checkCurrentPlayer(id)) {return null;}
        let wallToEdit = null;
        let wallBack = null;
        if (wall.classList.contains("horizontal_hitbox") || wall.classList.contains("vertical_hitbox")) {
            wallToEdit = wall.children.item(0);
            let coordinates = wallToEdit.id.split(',');
            if (wall.classList.contains("horizontal_hitbox")) {
                wallBack = this.model.getWallByCoordinates('H', coordinates[0], coordinates[1]);
            } else {
                wallBack = this.model.getWallByCoordinates('V', coordinates[0], coordinates[1]);
            }
            if (wallBack.isPresent === false) {
                wallBack.setPresent();
                this.model.setNextPlayer();
                return true;
            }
        }
        return false;
    }
}