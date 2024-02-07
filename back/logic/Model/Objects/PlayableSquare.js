import {Position} from "../../../../front/js/Game/Position.js";

export class PlayableSquare{
    constructor(x,y,player,isVisible) {
        this.position = new Position(x,y);
        this.player = player;
        this.isVisible = isVisible;
    }

    toString(){
        return this.position.toString() + "|Player: "+this.player;
    }
}