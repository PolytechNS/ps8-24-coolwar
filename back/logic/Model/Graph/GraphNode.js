import {GraphVertices} from "./GraphVertices.js"

export class GraphNode {
    constructor(position) {
        this.position = position.position;
        this.upLink = null;
        this.downLink = null;
        this.leftLink = null;
        this.rightLink = null;
    }

    //TODO : PAS TOUJOURS AJOUTE
    addLink(wall,nodeToAdd){
        console.log("----------ADD LINK----------");
        // 7-6
        // 8-6

        //UPLINK OU DOWNLINK
        if(wall.type==='H'){
            //DOWNLINK
            if(wall.position.col === this.position.col && wall.position.row===this.position.row){
                console.log("DOWNLINK");
                this.downLink = new GraphVertices(nodeToAdd);
            }
            //UPLINK
            if(wall.position.col === this.position.col && wall.position.row+1 === this.position.row){
                console.log("UPLINK");
                this.upLink = new GraphVertices(nodeToAdd);
            }
        }
        //LEFTLINK OU RIGHTLINK
        if(wall.type==='V'){
            //RIGHT LINK
            if(wall.position.col === this.position.col && wall.position.row===this.position.row){
                console.log("RIGHTLINK");
                this.rightLink = new GraphVertices(nodeToAdd);
            }
            //LEFT LINK
            if(wall.position.col+1 === this.position.col && wall.position.row===this.position.row ){
                console.log("LEFTLINK");
                this.leftLink = new GraphVertices(nodeToAdd);
            }
        }
    }
}