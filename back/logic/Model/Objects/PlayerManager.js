
export class PlayerManager {
    constructor() {
        this.players = new Map();
    }

    addPlayer(player){
        if(this.playerAlreadyOnPosition(player.position)){return false;}
        else{
            this.players.set(this.players.size+1,player);
            return true;
        }
    }

    playerAlreadyOnPosition(position){
        if(this.players.size>1){
            this.players.forEach((player)=>{
                if(player.position.x===position.x && player.position.y===position.y){return true;}
            });
        }
        return false;
    }
}