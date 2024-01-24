const horizontal_Walls = new Map();

function init_model(view){
    var nbLignes = view.nbLignes;
    var nbColonnes = view.nbColonnes;
    //-1 car une ligne de case jouable en plus
    for(var i=0;i<nbLignes-1;i++){
        for(var j=0;j<nbColonnes;j++){
            var key = i+","+j;
            horizontal_Walls.set(key,false);
        }
    }
}

function placeWall(wall) {
    console.log("PLACE WALL ON :"+wall.id);
    var wallBack = horizontal_Walls.get(wall.id);
    console.log(wallBack);
    if(wallBack===false){
        horizontal_Walls.set(wall.id,true);
        return true;
    }
    return false;
}

function init_behaviour(view) {
    var horizontal_walls_HTML = document.querySelectorAll(".horizontal_hitbox");
    horizontal_walls_HTML.forEach(function(wall){
        wall.addEventListener('click',function(){
            function removeAllBehaviour(wall) {
                wall.removeEventListener('mouseenter', function() {
                    wall.children.item(0).style.opacity = "0.8";
                });
                wall.removeEventListener('mouseleave', function() {
                    wall.children.item(0).style.opacity = "0";
                });
            }

            if(placeWall(wall.children.item(0))){
                removeAllBehaviour(wall);
                wall.children.item(0).style.opacity = 1;
            }
        });
    });
}

export class GamePresenter {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        window.addEventListener("load", (event) => {
            init_model(view);
            init_behaviour(view);
        })};
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