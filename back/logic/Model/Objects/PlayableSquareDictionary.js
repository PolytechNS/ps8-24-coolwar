const {PlayableSquare} = require("./PlayableSquare.js");

class PlayableSquareDictionary{
    constructor() {
        this.playableSquares = [];
    }

    addPlayableSquare(row,col,player,isVisible,visibility){
        this.playableSquares.push(new PlayableSquare(row,col,player,isVisible,parseInt(visibility)));
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