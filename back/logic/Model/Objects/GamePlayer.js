class GamePlayer {
    constructor(name,position,remainingWalls,order) {
        this.name=name;
        this.nbWalls = remainingWalls;
        this.position = position;
        this.order = order;
    }
    getRemainingWalls(){
        return this.nbWalls;
    }
    setWalls(nbWalls){
        this.nbWalls = nbWalls;
    }

    minusWall(){
        if(this.nbWalls>0){
            this.nbWalls--;
        }else{
            console.log("Le joueur "+this.name+" a plus de walls : "+parseInt(this.nbWalls));
        }
    }
}

module.exports = { GamePlayer };
