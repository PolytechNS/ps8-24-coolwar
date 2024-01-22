const HORIZONTAL_WALL_HEIGHT_NO_UNITS = 10;
const VERTICAL_WALL_WIDTH_NO_UNITS = 10;

window.addEventListener("load", (event) => {
    var nbLignes = 9;
    var nbColonnes = 9;

    for(var lignes=0;lignes<nbLignes*2;lignes++) {
        if(lignes===0 || lignes===nbLignes*2){}
        else {
            if (lignes % 2 === 0) {buildLineWithFullWall(nbColonnes);}
            else {buildLineWithPlayableSquare(nbLignes, nbColonnes);}
        }
    }
});

function buildLineWithFullWall(nbColumns){
    var plate = getPlate();
    var finalNbColumns = nbColumns*2;

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
                plate.appendChild(generateHorizontalWallHTMLElement());
            }
        }
    }
}

function buildLineWithPlayableSquare(nbLines,nbColumns){
    console.log("BUILD PLAYABLE");
    var plate = getPlate();

    for(var i=0;i<nbColumns;i++){
        plate.appendChild(generatePlayableSquare());
        if(i!==nbColumns-1){plate.appendChild(generateVerticalWallHTMLElement());}
    }
}

function getPlate(){return document.querySelector('.plate');}
function getEmptyHtmlElement(type){return document.createElement(type);}

function generateVerticalWallHTMLElement(){
    var wall= getEmptyHtmlElement("div");
    wall.classList.add("vertical_wall");
    return wall;
}
function generateHorizontalWallHTMLElement(){
    var wall= getEmptyHtmlElement("div");
    wall.classList.add("horizontal_wall");
    console.log(wall);
    return wall;
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