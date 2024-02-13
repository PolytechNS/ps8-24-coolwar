export class GraphVertices{
    constructor(destinationNode) {
        this.destinationNode = destinationNode;
    }

    getDestination(){
        return " --> "+this.destinationNode.position;
    }
}