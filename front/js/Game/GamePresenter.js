import {ActionController} from "../../../back/logic/Controller/actionController.js";

const hoverBehavior = (wall)=>{wall.children.item(0).style.opacity = "0.8";}
const leaveHoverBeahvior = (wall)=>{wall.children.item(0).style.opacity = "0";}

export class GamePresenter {
    constructor(model, view) {
        this.model = model;
        console.log(model);
        this.view = view;
        this.actionController=new ActionController(model);

        window.addEventListener('load', (event) => {
            this.init_behaviour(view,model,this.actionController);
        });
    };


        // Gérer les initialisations et les handlers d'événements ici

    handlePlayerMove(newPosition) {
        // Mettez à jour le modèle avec le nouveau mouvement du joueur
        // Puis mettez à jour la vue
        //this.view.updateBoard(this.model.board);
    }


    init_behaviour(view,model,actionController) {
        let horizontal_walls_HTML = document.querySelectorAll('.horizontal_hitbox');
        let vertical_walls_HTML = document.querySelectorAll('.vertical_hitbox');
        horizontal_walls_HTML.forEach(function(wall) {
            function hoverHandler() {hoverBehavior(wall);}
            function leaveHoverHandler() {leaveHoverBeahvior(wall);}

            function clickHandler() {
                //ENVOIE DE L'ACTION AU BACK AVEC 'isPlacable()'
                    if(actionController.placeWall(1,wall)){
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

        vertical_walls_HTML.forEach(function(wall) {
            function hoverHandler() {hoverBehavior(wall);}
            function leaveHoverHandler() {leaveHoverBeahvior(wall);}

            function clickHandler() {
                if (actionController.placeWall(1,wall)) {
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
}