import {Position} from "../../../../front/js/Game/Position.js";

export class Wall{
    constructor(x,y,isPresent) {
        this.position = new Position(x,y);
        this.isPresent = isPresent;
    }

    equals(x,y){return this.position.x.toString() === x.toString() && this.position.y.toString() === y.toString();}

    setPresent(){this.isPresent = true;}
}