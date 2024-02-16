const {Position} = require("./Position.js");
class PlayableSquare{
    constructor(row,col,player,isVisible,visibility) {
        this.position = new Position(row,col);
        this.player = player;
        this.isVisible = isVisible;
        this.playerId = null;
        this.visibility = visibility;
    }

    toString(){
        return this.position.toString() + "|GamePlayer: "+this.player;
    }
}

module.exports = { PlayableSquare };