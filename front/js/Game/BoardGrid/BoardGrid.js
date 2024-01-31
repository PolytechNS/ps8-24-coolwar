function getPlate(){return document.querySelector('.plate');}
function getEmptyHtmlElement(type){return document.createElement(type);}
function generateVerticalWallHTMLElement(nbLigne,nbElement){
    var container = getEmptyHtmlElement("div");
    var wall= getEmptyHtmlElement("div");
    wall.classList.add("vertical_wall");
    container.classList.add("vertical_hitbox");
    container.appendChild(wall);
    return container;
}
function generateHorizontalWallHTMLElement(nbLigne,nbElement){
    var container = getEmptyHtmlElement("div");
    var wall= getEmptyHtmlElement("img");
    wall.classList.add("horizontal_wall");
    wall.setAttribute("id",nbLigne.toString()+","+nbElement.toString());
    wall.setAttribute("src","../front/datas/horizontal_wall_texture.png");
    container.classList.add("horizontal_hitbox");
    container.appendChild(wall);
    return container;
}
function generateIntersectionElement(){
    var wall = getEmptyHtmlElement("div");
    wall.classList.add("intersection_wall");
    return wall;
}
function generatePlayableSquare(){
    var playable_square = getEmptyHtmlElement("div");
    playable_square.classList.add("playable_square");
    return playable_square;
}
export class BoardGrid{
    constructor() {
        this.plateElement = getPlate();
        this.nbLignes = 9;
        this.nbColonnes = 9;
    }
    createGrid(){
        var plate = this.plateElement;
        function buildLineWithFullWall(Y_plate_count,nbColumns){
            var finalNbColumns = nbColumns*2;

            var X_plate_count = 0;

            for(var i=0;i<finalNbColumns;i++) {
                var widthForOneWall;
                if(i===0){}
                else {
                    //intersection
                    if (i % 2 === 0) {
                        widthForOneWall = 0;
                        plate.appendChild(generateIntersectionElement());
                    }
                    //ligne
                    else {
                        plate.appendChild(generateHorizontalWallHTMLElement(Y_plate_count,X_plate_count));
                        X_plate_count++;
                    }
                }
            }
        }
        function buildLineWithPlayableSquare(nbLines,nbColumns){
            for(var i=0;i<nbColumns;i++){
                plate.appendChild(generatePlayableSquare());
                if(i!==nbColumns-1){plate.appendChild(generateVerticalWallHTMLElement(nbLines,i));}
            }
        }

        window.addEventListener("load", (event) => {
            //définit l'emplacement des éléments Y
            var Y_plate_count = 0;

            for(var lignes=0;lignes<this.nbLignes*2;lignes++) {
                if (lignes === 0 || lignes === this.nbLignes * 2) {
                } else {
                    if (lignes % 2 === 0) {
                        buildLineWithFullWall(Y_plate_count, this.nbColonnes);
                        Y_plate_count++;
                    } else {
                        buildLineWithPlayableSquare(Y_plate_count, this.nbColonnes);
                    }
                }
            }
    })}
}