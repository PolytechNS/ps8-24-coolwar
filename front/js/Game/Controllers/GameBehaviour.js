import {Utils} from "../../Utils/utils.js";

export class GameBehaviour{
    isPresentWall(wall,model) {
        let coordinates = Utils.prototype.getCoordinatesFromID(wall.children.item(0).id);
        if (wall.children.item(0).classList.contains("horizontal_wall")) {
            return this.getWall(model?.horizontal_Walls,parseInt(coordinates[0]), parseInt(coordinates[1]))?.isPresent;
        }
        if (wall.children.item(0).classList.contains("vertical_wall")) {
            return this.getWall(model?.vertical_Walls,parseInt(coordinates[0]), parseInt(coordinates[1]))?.isPresent;
        } else {
            return null;
        }
    }

    getWall(list,row,col){
        for(let i=0;i<list?.length;i++){
            let wall = list[i];
            if(parseInt(wall.position.row) === parseInt(row) && parseInt(wall.position.col) === parseInt(col)){return wall;}
        }console.log("AUCUN MUR TROUVE A CETTE POSITION !\n ["+row+"|"+col+"]")
        return null;
    }
}