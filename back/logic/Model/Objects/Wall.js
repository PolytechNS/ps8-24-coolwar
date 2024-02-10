import {Position} from "./Position.js";

export class Wall{
    constructor(row,col,isPresent) {
        this.position = new Position(row,col);
        this.isPresent = isPresent;
    }

    equals(row,col){return this.position.row.toString() === row.toString() && this.position.col.toString() === col.toString();}

    setPresent(){this.isPresent = true;}
}