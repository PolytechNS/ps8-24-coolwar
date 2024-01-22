window.addEventListener("load", (event) => {
    var nbLignes = 9;
    var nbColonnes = 9;

    //définit l'emplacement des éléments Y
    var Y_plate_count = 0;

    for(var lignes=0;lignes<nbLignes*2;lignes++) {
        if(lignes===0 || lignes===nbLignes*2){}
        else {
            if (lignes % 2 === 0) {buildLineWithFullWall(Y_plate_count,nbColonnes);Y_plate_count++;}
            else {buildLineWithPlayableSquare(Y_plate_count, nbColonnes);}
        }
    }

    var walls = document.querySelectorAll('.horizontal_hitbox');

    walls.forEach(function(wall) {
        // Ajouter un écouteur pour l'événement "mouseenter" (survol)
        wall.addEventListener('mouseenter', function() {
            wall.children.item(0).style.opacity = "0.8";
        });

        // Ajouter un écouteur pour l'événement "mouseleave" (quand le survol se termine)
        wall.addEventListener('mouseleave', function() {
            wall.children.item(0).style.opacity = "0";
        });
    });
});

addEventListener("mouseenter", (event) => {
        if(event.target.classList.contains("horizontal_wall")){
            event.target.style.opacity = "1";
        }
});
addEventListener("mouseleave", (event) => {
    console.log("LEAVE");
    if(event.target.classList.contains("horizontal_wall")){
        event.target.style.opacity = "0";
    }
});

function buildLineWithFullWall(Y_plate_count,nbColumns){
    var plate = getPlate();
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
    var plate = getPlate();
    for(var i=0;i<nbColumns;i++){
        plate.appendChild(generatePlayableSquare());
        if(i!==nbColumns-1){plate.appendChild(generateVerticalWallHTMLElement(nbLines,i));}
    }
}

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
    wall.setAttribute("src","../front/datas/wall_texture.png");
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