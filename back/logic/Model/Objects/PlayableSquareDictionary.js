import {PlayableSquare} from "./PlayableSquare.js";

export class PlayableSquareDictionary{
    constructor() {
        this.playableSquares = [];
    }

    addPlayableSquare(x,y,player,isVisible){
        this.playableSquares.push(new PlayableSquare(x,y,player,isVisible));
    }

    toString(){
        let result;
        this.playableSquares.forEach(function (PS){result += PS.toString()+"\n";});
        result += "\n";
        return result;
    }
}