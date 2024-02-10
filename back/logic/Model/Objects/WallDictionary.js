import {Wall} from "./Wall.js";


export class WallDictionary{
    constructor() {
        this.wallList = [];
    }

    addWall(x,y){
        //TODO: VERIFIER SI L'INDEX EXISTE DEJA
        this.wallList.push(new Wall(x,y,false));
    }

    getWall(x,y){
        //TODO: VERIFIER S'IL EXISTE
        let wallToReturn=null;
        this.wallList.forEach(function (wall){
            if(wall.equals(x,y)){wallToReturn=wall;}
        });
        return wallToReturn;
    }

    getLineOnX(x){
        let listToReturn = [];
        for(let i=0;i<this.wallList.length;i++){
            let wall = this.wallList[i];
            if(parseInt(wall.position.x)===parseInt(x)){listToReturn.push(wall);}
        }
        return listToReturn;
    }

    getLineOnY(y){
        let listToReturn = [];
        for(let i=0;i<this.wallList.length;i++){
            let wall = this.wallList[i];
            if(parseInt(wall.position.y)===parseInt(y)){listToReturn.push(wall);}
        }
        return listToReturn;
    }

    putWall(wall){
        //TODO: VERIFIER SI LE MUR EST DEJA POSE
        wall.isPresent = true;
    }
}