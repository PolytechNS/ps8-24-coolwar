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

    getCardinalSquares(row,col){
        let availableMovesPosition = [
            [parseInt(row),parseInt(col)+1],
            [parseInt(row),parseInt(col)-1],
            [parseInt(row)+1,parseInt(col)],
            [parseInt(row)-1,parseInt(col)]
        ];
        availableMovesPosition = availableMovesPosition.filter(pos => {
            return pos[0] >= 0 && pos[1] >= 0 && pos[0]<9 && pos[1]<9;
        });
        return availableMovesPosition;
    }

    getPlayableSquare(row,col){
        for(let i=0;this.playableSquares.length;i++){
            let playableSquare = this.playableSquares[i];
            if( parseInt(playableSquare.position.row)===parseInt(row) && parseInt(playableSquare.position.col)===parseInt(col)){
                return playableSquare;
            }
        }
        return null;
    }

    toString(){
        let result;
        this.playableSquares.forEach(function (PS){result += PS.toString()+"\n";});
        result += "\n";
        return result;
    }
}

module.exports = { PlayableSquareDictionary };