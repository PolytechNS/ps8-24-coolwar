export class BoardGrid{
    constructor() {
        this.HORIZONTAL_WALL_HEIGHT_NO_UNITS = 10;
        this.VERTICAL_WALL_WIDTH_NO_UNITS = 10;
        this.plateElement = this.getPlate();
        this.nbLignes = 9;
        this.nbColonnes = 9;
    }

    createGrid(){
        window.addEventListener("load", (event) => {

            this.buildEmptyGrid();

            for(var lignes=0;lignes<this.nbLignes*2;lignes++) {
                if(lignes===0 || lignes===this.nbLignes*2){}
                else {
                    if (lignes % 2 === 0) {
                        this.buildLineWithFullWall(this.nbColonnes);
                    } else {
                        this.buildLineWithPlayableSquare(this.nbLignes, this.nbColonnes);
                    }
                }
            }
        });
    }

    buildEmptyGrid() {
        //this.plate.setAttribute("grid-template-columns",4+"px");
    }

    buildLineWithFullWall(nbColumns){

        var finalNbColumns = nbColumns*2;
        var width_Plate = this.plateElement.offsetWidth;
        var squareWidthWithoutWall = width_Plate/nbColumns;
        var squareWidth = squareWidthWithoutWall - 2*this.VERTICAL_WALL_WIDTH_NO_UNITS;

        for(var i=0;i<finalNbColumns;i++) {
            var widthForOneWall;
            if(i===0){}
            else {
                //intersection
                if (i % 2 === 0) {
                    widthForOneWall = 0;
                    this.plateElement.appendChild(this.generateIntersectionElement());
                }
                //ligne
                else {
                    widthForOneWall = squareWidth;
                    this.plateElement.appendChild(this.generateHorizontalWallHTMLElement(widthForOneWall));
                }
            }
        }
    }

    buildLineWithPlayableSquare(nbLines,nbColumns){
        var height_Plate = this.plateElement.offsetHeight;
        var width_Plate = this.plateElement.offsetWidth;
        var widthSquareWithoutVerticalWalls = width_Plate/nbColumns;
        var heightForOneElement = height_Plate/nbLines - 2*this.HORIZONTAL_WALL_HEIGHT_NO_UNITS;

        var widthSquare = widthSquareWithoutVerticalWalls - 2*this.VERTICAL_WALL_WIDTH_NO_UNITS;

        for(var i=0;i<nbColumns;i++){
            this.plateElement.appendChild(this.generatePlayableSquare(widthSquare,heightForOneElement));
            if(i!==nbColumns-1){this.plateElement.appendChild(this.generateVerticalWallHTMLElement(heightForOneElement));}
            /*if(i===0){plate.appendChild(generatePlayableSquare(widthSquare,heightForOneElement));}
            else {
                plate.appendChild(generateVerticalWallHTMLElement(heightForOneElement));
                plate.appendChild(generatePlayableSquare(widthSquare, heightForOneElement));
            }*/
        }
    }

    getPlate(){return document.querySelector('.plate');}

    getEmptyHtmlElement(type){return document.createElement(type);}

    generateVerticalWallHTMLElement(height){
        var wall= this.getEmptyHtmlElement("div");
        wall.setAttribute("height",height+"px");
        wall.classList.add("vertical_wall");
        return wall;
    }

    generateHorizontalWallHTMLElement(width){
        var wall= this.getEmptyHtmlElement("div");
        wall.setAttribute("width",width+"px");
        wall.classList.add("horizontal_wall");
        return wall;
    }

    generateIntersectionElement(){
        var wall = this.getEmptyHtmlElement("div");
        wall.classList.add("intersection_wall");
        return wall;
    }

    generatePlayableSquare(widthSquare,heightSquare){
        var playable_square = this.getEmptyHtmlElement("div");
        playable_square.classList.add("playable_square");
        playable_square.setAttribute("width",widthSquare+"px");
        playable_square.setAttribute("height",heightSquare+"px");
        return playable_square;
    }

}




