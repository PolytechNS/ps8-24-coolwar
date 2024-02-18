const {GraphNode} = require("./GraphNode.js");
class Graph{
    constructor(playable_squares,horizontal_walls,vertical_walls) {
        this.nodes = [];
        this.vertices = [];
        this.playable_squares = playable_squares;
        this.horizontal_walls = horizontal_walls;
        this.vertical_walls = vertical_walls;
        this.init_nodes();
        this.init_vertices();
    }

    init_nodes(){
        //init tableau de nodes
        for(let i=0;i<this.playable_squares.playableSquares.length;i++){
            let square = this.playable_squares.playableSquares[i];
            this.nodes.push(new GraphNode(square));
        }
    }

    getNodeFromCoordinates(row,col){
        for(let i=0;i<this.nodes.length;i++){
            let node = this.nodes[i];
            if(parseInt(node.position.row)===parseInt(row) && parseInt(node.position.col)===parseInt(col)){return node;}
        }
        return null;
    }

    //INITIALISE LES LIENS
    init_vertices() {
        for(let i=0;i<this.nodes.length;i++){
            let node = this.nodes[i];
            let wallsNeighborhood = this.getWallsNeighborhood(node.position);
            for(let j=0;j<wallsNeighborhood.length;j++){
                let wall =  wallsNeighborhood[j];
                if(!wall.isPresent){
                    let nodeToLookingFor;
                    //wall en dessous
                    if(wall.position.row === node.position.row && wall.position.col===node.position.col && wall.type==='H'){
                        nodeToLookingFor = this.getNodeFromCoordinates(wall.position.row+1,wall.position.col);
                    }
                    //wall à droite
                    else if(wall.position.row === node.position.row && wall.position.col===node.position.col && wall.type==='V'){
                        nodeToLookingFor = this.getNodeFromCoordinates(wall.position.row,wall.position.col+1);
                    }
                    //wall en haut
                    else if(wall.position.row+1 === node.position.row && wall.position.col===node.position.col){
                        nodeToLookingFor = this.getNodeFromCoordinates(wall.position.row,wall.position.col);
                    }
                    //wall en bas
                    else if(wall.position.row===node.position.row && wall.position.col+1===node.position.col){
                        nodeToLookingFor = this.getNodeFromCoordinates(wall.position.row,wall.position.col);
                    }
                    //wall de la même position que le wall
                    else{nodeToLookingFor = this.getNodeFromCoordinates(wall.position.row,wall.position.col);}
                    //console.log("ADD LINK : WALL -> ",wall, " ON NODE ",nodeToLookingFor);

                    this.vertices.push(node.addLink(wall,nodeToLookingFor));
                }
            }
        }
    }

    getVerticesFromCoordinates(row,col){
        for(let i=0;i<this.vertices.length;i++){
            let vertice = this.vertices[i];
            if(vertice.parentNode.position.col === col && vertice.parentNode.position.row===col){

            }
        }
    }

    getWallsNeighborhood(position){
        let availableCardinalPosition = [
            [parseInt(position.row),parseInt(position.col)-1],
            [parseInt(position.row)-1,parseInt(position.col)]
        ];
        availableCardinalPosition = availableCardinalPosition.filter(position => {
            return position[0] >= 0 && position[1] >= 0 && position[0]<9 && position[1]<9;
        });

        let wallsNeighborhood = []

        //ON AJOUTE LE MUR DE DROITE QUE SI ON EST PAS SUR LE COTE
        if(position.col<8){wallsNeighborhood.push(this.vertical_walls.getWall(position.row,position.col,'V'));}
        //ON AJOUTE LE MUR D'EN BAS UNIQUEMENT SI ON EST AU MILIEU
        if(position.row<8) {wallsNeighborhood.push(this.horizontal_walls.getWall(position.row, position.col,'H'));}


        for(let i=0;i<availableCardinalPosition.length;i++){
            let tmpPosition = availableCardinalPosition[i];
            let colDiff = parseInt(tmpPosition[1]) - parseInt(position.col)
            let rowDiff = parseInt(tmpPosition[0]) - parseInt(position.row);

            if(colDiff!==0){
                wallsNeighborhood.push(this.vertical_walls.getWall(tmpPosition[0],tmpPosition[1],'V'));
            }
            else if(rowDiff!==0){
                wallsNeighborhood.push(this.horizontal_walls.getWall(tmpPosition[0],tmpPosition[1],'H'));
            }
        }
        return wallsNeighborhood;
    }
}

module.exports = {Graph};