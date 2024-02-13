const {Wall} = require("./Wall.js");


class WallDictionary{
    constructor() {
        this.wallList = [];
    }

    addWall(row,col,type){
        //TODO: VERIFIER SI L'INDEX EXISTE DEJA
        this.wallList.push(new Wall(row,col,false,type));
    }

    addWallWithType(row,col,type,isPresent){
        this.wallList.push(new Wall(row,col,isPresent,type));
    }

    getAllWalls(){
        return this.wallList;
    }

    getWall(row,col,type){
        console.log("GET WALL : "+row,col);
        let wallToReturn=null;
        this.wallList.forEach(function (wall){
            if(wall.equals(row,col,type)){wallToReturn=wall;}
        });
        return wallToReturn;
    }

    getLineOnX(row){
        let listToReturn = [];
        for(let i=0;i<this.wallList.length;i++){
            let wall = this.wallList[i];
            if(parseInt(wall.position.row)===parseInt(row)){listToReturn.push(wall);}
        }
        return listToReturn;
    }

    getLineOnY(col){
        let listToReturn = [];
        for(let i=0;i<this.wallList.length;i++){
            let wall = this.wallList[i];
            if(parseInt(wall.position.col)===parseInt(col)){listToReturn.push(wall);}
        }
        return listToReturn;
    }

    putWall(wall){
        //TODO: VERIFIER SI LE MUR EST DEJA POSE
        wall.isPresent = true;
    }
}

module.exports = { WallDictionary };