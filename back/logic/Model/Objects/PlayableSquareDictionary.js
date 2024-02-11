const {PlayableSquare} = require("./PlayableSquare.js");

class PlayableSquareDictionary{
    constructor() {
        this.playableSquares = [];
    }

    addPlayableSquare(row,col,player,isVisible){
        this.playableSquares.push(new PlayableSquare(row,col,player,isVisible));
    }

    getAllPlayableSquares(){
        return this.playableSquares;

    }

    toString(){
        let result;
        this.playableSquares.forEach(function (PS){result += PS.toString()+"\n";});
        result += "\n";
        return result;
    }
}

module.exports = { PlayableSquareDictionary };