import {Utils} from "../Utils/utils.js";

export class GameBehaviour{
    static isPresentWall(wall,model) {
        let coordinates = Utils.prototype.getCoordinatesFromID(wall.children.item(0).id);

        if (wall.children.item(0).classList.contains("horizontal_wall")) {
            return model.horizontal_Walls.getWall(parseInt(coordinates[0]), parseInt(coordinates[1])).isPresent;
        }
        if (wall.children.item(0).classList.contains("vertical_wall")) {
            return model.vertical_Walls.getWall(parseInt(coordinates[0]), parseInt(coordinates[1])).isPresent;
        } else {
            console.log("AUCUN MUR TROUVE A CETTE POSITION !\n [" + coordinates[0] + "|" + coordinates[1] + "]");
            return null;
        }
    }
}