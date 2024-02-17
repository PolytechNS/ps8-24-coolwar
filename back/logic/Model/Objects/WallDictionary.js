const {Wall} = require("./Wall.js");


class WallDictionary{
    constructor() {
        this.wallList = [];
    }

    addWall(row,col,type,isPresent,owner,wallGroup){
        this.wallList.push(new Wall(row,col,isPresent,type,owner,wallGroup));
    }

    getAllWalls(){
        return this.wallList;
    }

    getWall(row,col,type){
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