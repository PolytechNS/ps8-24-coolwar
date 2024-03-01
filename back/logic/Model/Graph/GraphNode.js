const {GraphVertices} = require("./GraphVertices.js");

class GraphNode {
    constructor(position) {
        this.position = position.position;
        this.upLink = null;
        this.downLink = null;
        this.leftLink = null;
        this.rightLink = null;
    }


    addLink(wall,nodeToAdd){
        let verticesToReturn = null;
        //UPLINK OU DOWNLINK
        if(wall.type==='H'){
            //DOWNLINK
            if(wall.position.col === this.position.col && wall.position.row===this.position.row){
                //console.log("DOWNLINK");
                verticesToReturn = new GraphVertices(this,nodeToAdd);
                this.downLink = verticesToReturn;
            }
            //UPLINK
            if(wall.position.col === this.position.col && wall.position.row+1 === this.position.row){
                //console.log("UPLINK");
                verticesToReturn = new GraphVertices(this,nodeToAdd);
                this.upLink = verticesToReturn;
            }
        }
        //LEFTLINK OU RIGHTLINK
        if(wall.type==='V'){
            //RIGHT LINK
            if(wall.position.col === this.position.col && wall.position.row===this.position.row){
                //console.log("RIGHTLINK");
                verticesToReturn = new GraphVertices(this,nodeToAdd);
                this.rightLink = verticesToReturn;
            }
            //LEFT LINK
            if(wall.position.col+1 === this.position.col && wall.position.row===this.position.row ){
                //console.log("LEFTLINK");
                verticesToReturn = new GraphVertices(this,nodeToAdd);
                this.leftLink = verticesToReturn;
            }
        }
        return verticesToReturn;
    }

    getNeighborhood(){
        let neighborhood = [];
        if(this.upLink!==null){neighborhood.push(this.upLink.destinationNode);}
        if(this.downLink!==null){neighborhood.push(this.downLink.destinationNode);}
        if(this.leftLink!==null){neighborhood.push(this.leftLink.destinationNode);}
        if(this.rightLink!==null){neighborhood.push(this.rightLink.destinationNode);}
        return neighborhood;
    }
}

module.exports = {GraphNode};