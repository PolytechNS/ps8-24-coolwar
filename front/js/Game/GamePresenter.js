import {ActionController} from "../../../back/logic/Controller/actionController.js";
import {Utils} from "../Utils/utils.js";

const wall_hoverBehavior = (wall)=>{wall.children.item(0).style.opacity = "0.8";}
const wall_leaveHoverBeahvior = (wall)=>{wall.children.item(0).style.opacity = "0";}


//TODO : CHERCHER POURQUOI CA TROUVE RIEN ?
const getCaseFromCoordinates = (x, y) => {
    let toSend = null;
    document.querySelectorAll('.playable_square').forEach((playable_case)=>{
        let coordinates = Utils.prototype.getCoordinatesFromID(playable_case.id);
        if(coordinates[0].toString()===x.toString() && coordinates[1].toString()===y.toString()){toSend=playable_case;}
    });
    return toSend;
};

export class GamePresenter {
    constructor(model, view) {
        this.actionController=new ActionController(model);
        this.model = model;
        window.addEventListener('load', (event) => {
            this.init_behaviour(view,model,this.actionController);
        });
        this.currentPlayer = 1;
    };


    init_behaviour(view,model,actionController) {
        let horizontal_walls_HTML = document.querySelectorAll('.horizontal_hitbox');
        let vertical_walls_HTML = document.querySelectorAll('.vertical_hitbox');
        let playable_case_HTML = document.querySelectorAll('.playable_square');
        let currentPlayer_inside = this.currentPlayer;
        horizontal_walls_HTML.forEach(function(wall) {
            function hoverHandler() {wall_hoverBehavior(wall);}
            function leaveHoverHandler() {wall_leaveHoverBeahvior(wall);}

            function clickHandler() {
                //ENVOIE DE L'ACTION AU BACK AVEC 'isPlacable()'
                    if(actionController.placeWall(1,wall)){
                        wall.removeEventListener('mouseenter', hoverHandler);
                        wall.removeEventListener('mouseleave', leaveHoverHandler);
                        wall.removeEventListener('click', clickHandler);
                        wall.children.item(0).style.opacity = "1";
                        updateCurrentPlayer();
                    }
            }

            wall.addEventListener('mouseenter', hoverHandler);
            wall.addEventListener('mouseleave', leaveHoverHandler);
            wall.addEventListener('click', clickHandler);
        });
        vertical_walls_HTML.forEach(function(wall) {
            function hoverHandler() {wall_hoverBehavior(wall);}
            function leaveHoverHandler() {wall_leaveHoverBeahvior(wall);}

            function clickHandler() {
                if (actionController.placeWall(currentPlayer_inside,wall)) {
                    wall.removeEventListener('mouseenter', hoverHandler);
                    wall.removeEventListener('mouseleave', leaveHoverHandler);
                    wall.removeEventListener('click', clickHandler);
                    wall.children.item(0).style.opacity = "1";
                    updateCurrentPlayer();
                }
            }

            wall.addEventListener('mouseenter', hoverHandler);
            wall.addEventListener('mouseleave', leaveHoverHandler);
            wall.addEventListener('click', clickHandler);
        });


        playable_case_HTML.forEach(function(playable_case){
            /*TODO: TERMINER CETTE FONCTION
               SUPPRIMER LA MISE EN FORME DE L'ANCIENNE CASE
            */
            function clickHandler(){
                let tab = Utils.prototype.getCoordinatesFromID(playable_case.id);
                if(actionController.characterCanBeMoved(tab[0],tab[1])){
                    let oldPosition = model.player_array.getPlayerPosition(1);
                    console.log(oldPosition);
                    let caseToAlter = getCaseFromCoordinates(oldPosition);
                    console.log(caseToAlter);
                    actionController.moveCharacter(currentPlayer_inside,tab[0],tab[1]);
                    //let oldCase = getCaseFromCoordinates(positionBeforeMove[0],positionBeforeMove[1]);
                    view.boardGrid.displayPlayer(tab[0],tab[1],currentPlayer_inside);
                    updateCurrentPlayer();
                }
            }

            playable_case.addEventListener('click', clickHandler);

        });

        function updateCurrentPlayer() {
            if(currentPlayer_inside===1){currentPlayer_inside=2;}
            else if(currentPlayer_inside===2){currentPlayer_inside=1;}
            else{}
            console.log("After next Player : "+currentPlayer_inside);
        }
    }
}