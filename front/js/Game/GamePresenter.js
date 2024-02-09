import {ActionController} from "../../../back/logic/Controller/actionController.js";
import {Utils} from "../Utils/utils.js";

const wall_hoverBehavior = (wall)=>{
    console.log("HOVER ON");
    //SURVOLER UN MUR = SURVOLER DEUX MURS
    //conversion en position
    let neighborhood = getWallNeighborhood(wall);
    wall.children.item(0).style.opacity = "0.8";
    neighborhood.children.item(0).style.opacity = "0.8";
}
const wall_leaveHoverBeahvior = (wall)=>{
    console.log("HOVER OFF");
    let neighborhood = getWallNeighborhood(wall);
    wall.children.item(0).style.opacity = "0";
    neighborhood.children.item(0).style.opacity = "0";
}


const getWallNeighborhood = (wall) => {
    let nbColonnes = 9;
    let nbLignes = 9;
    let wallPosition = Utils.prototype.getCoordinatesFromID(wall.children.item(0).id)
    //si mur HORIZONTAL A GAUCHE
    if(parseInt(wallPosition[1])===0 && wall.classList.contains('horizontal_hitbox')){
        let hWalls = document.querySelectorAll('.horizontal_hitbox');
        let xToFind = parseInt(wallPosition[0]);
        let yToFind = parseInt(wallPosition[1])+1;
        //SI DES MURS PEUVENT ETRE EENCORE POSES
        for(let i=0;i<hWalls.length;i++){
            let coordinates = Utils.prototype.getCoordinatesFromID(hWalls.item(i).children.item(0).id);
            if(xToFind===parseInt(coordinates[0]) && yToFind===parseInt(coordinates[1])){
                return hWalls.item(i);
            }
        }
    }
    //si mur vertical tout en haut
    if(parseInt(wallPosition[0])===0 && wall.classList.contains('vertical_hitbox')){
        let vWalls = document.querySelectorAll('.vertical_hitbox');
        let xToFind = parseInt(wallPosition[0])+1;
        let yToFind = parseInt(wallPosition[1]);
        //SI DES MURS PEUVEENT ETRE EENCORE POSES
        for(let i=0;i<vWalls.length;i++){
            let coordinates = Utils.prototype.getCoordinatesFromID(vWalls.item(i).children.item(0).id);
            if(xToFind===parseInt(coordinates[0]) && yToFind===parseInt(coordinates[1])){
                return vWalls.item(i);
            }
        }
    }
    //si mur vertical tout en bas
    if(parseInt(wallPosition[0])===nbLignes-1 && wall.classList.contains('vertical_hitbox')){
        let vWalls = document.querySelectorAll('.vertical_hitbox');
        let xToFind = parseInt(wallPosition[0])-1;
        let yToFind = parseInt(wallPosition[1]);
        //SI DES MURS PEUVENT ETRE ENCORE POSES
        for(let i=0;i<vWalls.length;i++){
            let coordinates = Utils.prototype.getCoordinatesFromID(vWalls.item(i).children.item(0).id);
            if(xToFind===parseInt(coordinates[0]) && yToFind===parseInt(coordinates[1])){
                return vWalls.item(i);
            }
        }
    }
    //si mur horizontal A DROITE
    if(parseInt(wallPosition[1])===nbColonnes-1 && wall.classList.contains('horizontal_hitbox')){
        let hWalls = document.querySelectorAll('.horizontal_hitbox');
        let xToFind = parseInt(wallPosition[0]);
        let yToFind = parseInt(wallPosition[1])-1;
        //SI DES MURS PEUVEENT ETRE EENCORE POSES
        for(let i=0;i<hWalls.length;i++){
            let coordinates = Utils.prototype.getCoordinatesFromID(hWalls.item(i).children.item(0).id);
            if(xToFind===parseInt(coordinates[0]) && yToFind===parseInt(coordinates[1])){
                return hWalls.item(i);
            }
        }
    }
    //autre cas PAR DEFAUT
    if(wall.classList.contains('horizontal_hitbox')){
        let hWalls = document.querySelectorAll('.horizontal_hitbox');
        let xToFind = parseInt(wallPosition[0]);
        let yToFind = parseInt(wallPosition[1])+1;
        //SI DES MURS PEUVEENT ETRE EENCORE POSES
        for(let i=0;i<hWalls.length;i++){
            let coordinates = Utils.prototype.getCoordinatesFromID(hWalls.item(i).children.item(0).id);
            if(xToFind===parseInt(coordinates[0]) && yToFind===parseInt(coordinates[1])){
                return hWalls.item(i);
            }
        }
    }
    if(wall.classList.contains('vertical_hitbox')){
        let vWalls = document.querySelectorAll('.vertical_hitbox');
        let xToFind = parseInt(wallPosition[0])+1;
        let yToFind = parseInt(wallPosition[1]);
        //SI DES MURS PEUVEENT ETRE EENCORE POSES
        for(let i=0;i<vWalls.length;i++){
            let coordinates = Utils.prototype.getCoordinatesFromID(vWalls.item(i).children.item(0).id);
            if(xToFind===parseInt(coordinates[0]) && yToFind===parseInt(coordinates[1])){
                return vWalls.item(i);
            }
        }
    }
    return null;
}
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
                let neighborhood = getWallNeighborhood(wall);
                let wallList = [wall,neighborhood];
                console.log(wallList);
                    if(actionController.placeWall(1,wallList)){
                        for(let i=0;i<wallList.length;i++){
                            let wallToEdit = wallList[i];
                            console.log(wallToEdit);
                            wallToEdit.removeEventListener('mouseenter', hoverHandler);
                            wallToEdit.removeEventListener('mouseleave', leaveHoverHandler);
                            wallToEdit.removeEventListener('click', clickHandler);
                            wallToEdit.children.item(0).style.opacity = "1";
                        }
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
            /*if(currentPlayer_inside===1){currentPlayer_inside=2;}
            else if(currentPlayer_inside===2){currentPlayer_inside=1;}
            else{}*/
            console.log("After next Player : "+currentPlayer_inside);
        }
    }
}