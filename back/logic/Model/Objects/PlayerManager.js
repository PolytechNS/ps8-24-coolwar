const {Position} = require("./Position");
const {GamePlayer} = require("./GamePlayer");

class PlayerManager {
    constructor() {
        this.players = [];
    }

    getPlayer(index){
        return this.players[index-1];
    }

    getAllPlayers(){
        return this.players;
    }

    createPlayFromArray(array){
        for(let i=0;i<array.length;i++){
            let player = new GamePlayer(array[i].name,new Position(array[i].position.row,array[i].position.col));
            this.players.push(player);
        }
    }

    addPlayer(player){
        if(this.playerAlreadyOnPosition(player.position)){return false;}
        else{
            this.players.push(player);
            return true;
        }
    }

    playerAlreadyOnPosition(row,col){
        if(this.players.size>1){
            for(let i=0;i<this.players.length;i++){
                let player = this.players[i+1];
                if( player.position.row.toString() === row.toString() && player.position.col.toString() === col.toString() ){return true;}
            }
        }
        return false;
    }

    getPlayerPosition(id){
        if(this.players[id-1]!=null){return this.players[id-1].position;}
        console.log("NULL ELEMENT!");
        return null;
    }


}

module.exports = { PlayerManager };