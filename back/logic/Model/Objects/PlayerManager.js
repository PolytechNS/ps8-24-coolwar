
class PlayerManager {
    constructor() {
        this.players = new Map();
    }

    getPlayer(index){
        return this.players.get(index);
    }

    addPlayer(player){
        if(this.playerAlreadyOnPosition(player.position)){return false;}
        else{
            this.players.set(this.players.size+1,player);
            return true;
        }
    }

    playerAlreadyOnPosition(row,col){
        if(this.players.size>1){
            for(let i=0;i<this.players.size;i++){
                let player = this.players.get(i+1);
                if( player.position.row.toString() === row.toString() && player.position.col.toString() === col.toString() ){return true;}
            }
        }
        return false;
    }

    getPlayerPosition(id){
        if(this.players.get(id)!=null){return this.players.get(id).position;}
        console.log("NULL ELEMENT!");
        return null;
    }
}

module.exports = { PlayerManager };