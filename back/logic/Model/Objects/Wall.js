const {Position} = require("./Position.js");

class Wall{
    constructor(row,col,isPresent,type,owner,wallGroup) {
        this.position = new Position(row,col);
        this.isPresent = isPresent;
        this.type = type;
        this.idPlayer = owner;
        this.wallGroup = wallGroup;
    }

    setWallGroup(wallGroup){this.wallGroup = wallGroup;}

    equals(row,col,type){
        return this.position.row.toString() === row.toString() && this.position.col.toString() === col.toString() && this.type===type ;
    }

    setPresent(){this.isPresent = true;}
    setNotPresent(){this.isPresent = false;}

    setOwner(playerId){
        this.idPlayer = playerId;
    }

    toString(){
        return "WALL : "+this.position.toString()+" - "+this.isPresent+" - "+this.type+" - "+this.idPlayer+" - "+this.wallGroup;
    }
}

module.exports = { Wall };