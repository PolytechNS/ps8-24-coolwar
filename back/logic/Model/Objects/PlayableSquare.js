import {Position} from "./Position.js";

export class PlayableSquare{
    constructor(x,y,player,isVisible) {
        this.position = new Position(x,y);
        this.player = player;
        this.isVisible = isVisible;
    }

    toString(){
        return this.position.toString() + "|GamePlayer: "+this.player;
    }
}