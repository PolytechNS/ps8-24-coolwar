export class GraphVertices{
    constructor(parentNode,destinationNode) {
        this.parentNode = parentNode;
        this.destinationNode = destinationNode;
    }

    getDestination(){
        return " --> "+this.destinationNode.position;
    }
}