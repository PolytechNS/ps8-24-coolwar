import {Position} from "./Position.js";

export class PlayableSquare{
    constructor(row,col,player,isVisible) {
        this.position = new Position(row,col);
        this.player = player;
        this.isVisible = isVisible;
    }

    toString(){
        return this.position.toString() + "|GamePlayer: "+this.player;
    }
}