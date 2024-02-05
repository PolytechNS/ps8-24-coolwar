const horizontal_Walls = new Map();
const vertical_Walls = new Map();

function init_model(view){
    var nbLignes = view.nbLignes;
    var nbColonnes = view.nbColonnes;
    //-1 car une ligne de case jouable en plus
    for(var i=0;i<nbLignes-1;i++){
        for(var j=0;j<nbColonnes;j++){
            var key = i+","+j;
            horizontal_Walls.set(key,false);
            vertical_Walls.set(key,false);
        }
    }
}

function placeWall(wall) {
    var wallToEdit = null;
    var wallBack = null;
    console.log(wall);
    if(wall.classList.contains("horizontal_hitbox")){
        wallToEdit = wall.children.item(0);
        console.log("PLACE WALL ON :"+wallToEdit.id);
        wallBack = horizontal_Walls.get(wallToEdit.id);
        console.log(wallBack);
        if(wallBack===false){
            horizontal_Walls.set(wallToEdit.id,true);
            return true;
        }
        return false;
    }
    if(wall.classList.contains("vertical_hitbox")){
        wallToEdit = wall.children.item(0);
        console.log("PLACE WALL ON :"+wallToEdit.id);
        wallBack = vertical_Walls.get(wallToEdit.id);
        console.log(wallBack);
        if(wallBack===false){
            vertical_Walls.set(wallToEdit.id,true);
            return true;
        }
        return false;
    }
}

const hoverBehavior = (wall)=>{wall.children.item(0).style.opacity = "0.8";}
const leaveHoverBeahvior = (wall)=>{wall.children.item(0).style.opacity = "0";}


function init_behaviour(view) {
    var horizontal_walls = document.querySelectorAll('.horizontal_hitbox');
    var vertical_walls = document.querySelectorAll('.vertical_hitbox');
    horizontal_walls.forEach(function(wall) {
        function hoverHandler() {hoverBehavior(wall);}
        function leaveHoverHandler() {leaveHoverBeahvior(wall);}

        function clickHandler() {
            if (placeWall(wall)) {
                wall.removeEventListener('mouseenter', hoverHandler);
                wall.removeEventListener('mouseleave', leaveHoverHandler);
                wall.removeEventListener('click', clickHandler);
                wall.children.item(0).style.opacity = "1";
            }
        }

        wall.addEventListener('mouseenter', hoverHandler);
        wall.addEventListener('mouseleave', leaveHoverHandler);
        wall.addEventListener('click', clickHandler);
    });

    vertical_walls.forEach(function(wall) {
        function hoverHandler() {hoverBehavior(wall);}
        function leaveHoverHandler() {leaveHoverBeahvior(wall);}

        function clickHandler() {
            if (placeWall(wall)) {
                wall.removeEventListener('mouseenter', hoverHandler);
                wall.removeEventListener('mouseleave', leaveHoverHandler);
                wall.removeEventListener('click', clickHandler);
                wall.children.item(0).style.opacity = "1";
            }
        }

        wall.addEventListener('mouseenter', hoverHandler);
        wall.addEventListener('mouseleave', leaveHoverHandler);
        wall.addEventListener('click', clickHandler);
    });


}

export class GamePresenter {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        window.addEventListener('load', (event) => {
            init_model(view);
            init_behaviour(view);
        });
    };
        // Gérer les initialisations et les handlers d'événements ici

    handlePlayerMove(newPosition) {
        // Mettez à jour le modèle avec le nouveau mouvement du joueur
        // Puis mettez à jour la vue
        this.view.updateBoard(this.model.board);
    }
}

export class wall{
    constructor(wallHTML) {

    }
}