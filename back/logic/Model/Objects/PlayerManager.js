
class PlayerManager {
    constructor() {
        this.players = [];
    }

    getPlayer(index){
        return this.players[index];
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
        if(this.players[id]!=null){return this.players[id].position;}
        console.log("NULL ELEMENT!");
        return null;
    }


}

module.exports = { PlayerManager };