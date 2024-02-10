import {PlayableSquare} from "./PlayableSquare.js";

export class PlayableSquareDictionary{
    constructor() {
        this.playableSquares = [];
    }

    addPlayableSquare(row,col,player,isVisible){
        this.playableSquares.push(new PlayableSquare(row,col,player,isVisible));
    }

    toString(){
        let result;
        this.playableSquares.forEach(function (PS){result += PS.toString()+"\n";});
        result += "\n";
        return result;
    }
}