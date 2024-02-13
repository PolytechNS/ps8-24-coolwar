import {Position} from "./Position.js";

export class Wall{
    constructor(row,col,isPresent,type) {
        this.position = new Position(row,col);
        this.isPresent = isPresent;
        this.type = type;
    }

    equals(row,col){return this.position.row.toString() === row.toString() && this.position.col.toString() === col.toString();}

    setPresent(){this.isPresent = true;}
}