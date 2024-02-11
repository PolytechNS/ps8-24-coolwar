const {Position} = require("./Position.js");

class Wall{
    constructor(row,col,isPresent,type) {
        this.position = new Position(row,col);
        this.isPresent = isPresent;
        this.type = type;
    }

    equals(row,col,type){return this.position.row.toString() === row.toString() && this.position.col.toString() === col.toString() && this.type===type ;}

    setPresent(){this.isPresent = true;}
}

module.exports = { Wall };