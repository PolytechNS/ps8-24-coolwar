import {actionGameService} from "../Services/actionGameService.js";
import {gameService} from "../Services/gameService.js";
import {Utils} from "../Utils/utils.js";
import {GameBehaviour} from "./GameBehaviour.js";

const getWallNeighborhood = (wall) => {
    let nbColonnes = 9;
    let nbLignes = 9;
    let wallPosition = Utils.prototype.getCoordinatesFromID(wall.children.item(0).id)
    let wallToReturn = null;

    //si mur vertical tout en bas
    if(parseInt(wallPosition[0])===nbLignes-1 && wall.classList.contains('vertical_hitbox')){
        let vWalls = document.querySelectorAll('.vertical_hitbox');
        let xToFind = parseInt(wallPosition[0])-1;
        let yToFind = parseInt(wallPosition[1]);
        //SI DES MURS PEUVENT ETRE ENCORE POSES
        for(let i=0;i<vWalls.length;i++){
            let coordinates = Utils.prototype.getCoordinatesFromID(vWalls.item(i).children.item(0).id);
            if(xToFind===parseInt(coordinates[0]) && yToFind===parseInt(coordinates[1])){
                wallToReturn = vWalls.item(i);
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
                wallToReturn = hWalls.item(i);
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
                wallToReturn = hWalls.item(i);
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
                wallToReturn = vWalls.item(i);
            }
        }
    }
    return wallToReturn;
}
const getWallNeighborhood_Invert = (wall) => {
    let nbColumns = 9;
    let nbLines = 9;
    let wallPosition = Utils.prototype.getCoordinatesFromID(wall.children.item(0).id)
    let wallToReturn = null;

    //si mur vertical tout en bas
    if(parseInt(wallPosition[0])===nbLines-1 && wall.classList.contains('vertical_hitbox')){
        let vWalls = document.querySelectorAll('.vertical_hitbox');
        let rowToFind = parseInt(wallPosition[0])-1;
        let colToFind = parseInt(wallPosition[1]);
        //SI DES MURS PEUVENT ETRE ENCORE POSES
        for(let i=0;i<vWalls.length;i++){
            let coordinates = Utils.prototype.getCoordinatesFromID(vWalls.item(i).children.item(0).id);
            if(rowToFind===parseInt(coordinates[0]) && colToFind===parseInt(coordinates[1])){
                wallToReturn = vWalls.item(i);
            }
        }
    }
    //si mur horizontal A DROITE
    if(parseInt(wallPosition[1])===nbColumns-1 && wall.classList.contains('horizontal_hitbox')){
        let hWalls = document.querySelectorAll('.horizontal_hitbox');
        let rowToFind = parseInt(wallPosition[0]);
        let colToFind = parseInt(wallPosition[1])-1;
        //SI DES MURS PEUVEENT ETRE EENCORE POSES
        for(let i=0;i<hWalls.length;i++){
            let coordinates = Utils.prototype.getCoordinatesFromID(hWalls.item(i).children.item(0).id);
            if(rowToFind===parseInt(coordinates[0]) && colToFind===parseInt(coordinates[1])){
                wallToReturn = hWalls.item(i);
            }
        }
    }
    //autre cas PAR DEFAUT
    if(wall.classList.contains('horizontal_hitbox')){
        let hWalls = document.querySelectorAll('.horizontal_hitbox');
        let rowToFind = parseInt(wallPosition[0]);
        let colToFind = parseInt(wallPosition[1])-1;
        //SI DES MURS PEUVEENT ETRE EENCORE POSES
        for(let i=0;i<hWalls.length;i++){
            let coordinates = Utils.prototype.getCoordinatesFromID(hWalls.item(i).children.item(0).id);
            if(rowToFind===parseInt(coordinates[0]) && colToFind===parseInt(coordinates[1])){
                wallToReturn = hWalls.item(i);
            }
        }
    }
    if(wall.classList.contains('vertical_hitbox')){
        let vWalls = document.querySelectorAll('.vertical_hitbox');
        let rowToFind = parseInt(wallPosition[0])-1;
        let colToFind = parseInt(wallPosition[1]);
        //SI DES MURS PEUVEENT ETRE EENCORE POSES
        for(let i=0;i<vWalls.length;i++){
            let coordinates = Utils.prototype.getCoordinatesFromID(vWalls.item(i).children.item(0).id);
            if(rowToFind===parseInt(coordinates[0]) && colToFind===parseInt(coordinates[1])){
                wallToReturn = vWalls.item(i);
            }
        }
    }
    return wallToReturn;
}
const getCaseFromCoordinates = (row, col) => {
    let toSend = null;
    document.querySelectorAll('.playable_square').forEach((playable_case)=>{
        let coordinates = Utils.prototype.getCoordinatesFromID(playable_case.id);
        if(parseInt(coordinates[0])===parseInt(row) && parseInt(coordinates[1])===parseInt(col)){toSend=playable_case;}
    });
    return toSend;
};

export class GamePresenter {
    constructor(model, view) {
        this.view = view;
        this.model = model;
        this.init_behaviour();
        this.updateInformations();
        this.gameBehaviour = new GameBehaviour();
        this.attachSaveHandler();
        this.currentPlayer = this.model.currentPlayer;
        this.roundCounter = this.model.roundCounter;
    }

    attachSaveHandler() {
        document.getElementById('save').addEventListener('click', () => {
            // Ici, vous devriez avoir accès à 'this.model' qui contient l'état actuel du jeu
            console.log('Save button clicked');
            const gameState = this.model; // Assurez-vous que c'est l'état du jeu complet que vous souhaitez envoyer
            // Vous devriez probablement convertir 'gameState' en un format approprié si nécessaire
            gameService.saveGame(gameState);
        });
    }

    init_behaviour() {
        let horizontal_walls_HTML = document.querySelectorAll('.horizontal_hitbox');
        let vertical_walls_HTML = document.querySelectorAll('.vertical_hitbox');
        let playable_case_HTML = document.querySelectorAll('.playable_square')

       this.init_walls(horizontal_walls_HTML);
       this.init_walls(vertical_walls_HTML);
       this.init_playable_case(playable_case_HTML);
    }

    cancel_behaviour(){
        let horizontal_walls_HTML = document.querySelectorAll('.horizontal_hitbox');
        let vertical_walls_HTML = document.querySelectorAll('.vertical_hitbox');
        let playable_case_HTML = document.querySelectorAll('.playable_square');

        function cancel_behaviour_func (list){
            list.forEach((wall)=> {
                let replaceOBJ = wall.cloneNode(true);
                wall.replaceWith(replaceOBJ);
            });
        }

        cancel_behaviour_func(horizontal_walls_HTML);
        cancel_behaviour_func(vertical_walls_HTML);
        cancel_behaviour_func(playable_case_HTML);
    }

    init_walls(list){
        list.forEach((wall)=> {
            const hoverHandler = () => {
                let neighborhood = getWallNeighborhood(wall);
                if(!this.gameBehaviour.isPresentWall(neighborhood)){
                    neighborhood.children.item(0).style.opacity = "0.8";
                }
                else {
                    neighborhood = getWallNeighborhood_Invert(wall);
                    if (!this.gameBehaviour.isPresentWall(neighborhood)) {
                        neighborhood.children.item(0).style.opacity = "0.8";
                    }
                }
                wall.children.item(0).style.opacity = "0.8";
            };

            const leaveHoverHandler = () => {
                let neighborhood = getWallNeighborhood(wall);
                if(!this.gameBehaviour.isPresentWall(neighborhood)){
                    neighborhood.children.item(0).style.opacity = "0";
                }
                else{
                    neighborhood = getWallNeighborhood_Invert(wall);
                    if(!this.gameBehaviour.isPresentWall(neighborhood)){
                        neighborhood.children.item(0).style.opacity = "0";
                    }
                }
                wall.children.item(0).style.opacity = "0";
            };

            const clickHandler = () => {
                let neighborhood = getWallNeighborhood(wall);
                if (this.gameBehaviour.isPresentWall(neighborhood,this.model)) {
                    neighborhood = getWallNeighborhood_Invert(wall);
                }
                let wallListReq = [wall.children.item(0).id];
                let wallListObj = [wall];
                if (!this.gameBehaviour.isPresentWall(neighborhood)) {
                    wallListReq.push(neighborhood.children.item(0).id);
                    wallListObj.push(neighborhood);
                }

                //CALL BD -
                actionGameService.placeWall(wallListReq, (res)=>{
                    wallListObj.forEach((wallToEdit) => {
                        this.view.displayWall(wallToEdit, 1);
                        let replaceOBJ = wallToEdit.cloneNode(true);
                        wallToEdit.replaceWith(replaceOBJ);
                    });
                    this.updatePage();
                });
            };

            wall.addEventListener('mouseenter', hoverHandler);
            wall.addEventListener('mouseleave', leaveHoverHandler);
            wall.addEventListener('click', clickHandler);
        });
    }

    checkEndGame(){
        actionGameService.checkWinner((callback)=>{
            console.log(callback);
            if(callback!==-1){this.cancel_behaviour();}
        });
    }
    updatePage() {
        actionGameService.updateGameInformation((callback)=>{
            console.log(callback);
            this.currentPlayer = callback[0];
            this.roundCounter = callback[1];
        });
        actionGameService.updateWalls((callback)=>{
            this.model.horizontal_Walls = callback[0];
            this.model.vertical_Walls = callback[1];
        })
        this.checkEndGame();
        this.updateInformations();
    }
    updateInformations(){
        let rounds = document.querySelectorAll('#rounds');
        let curplayer_HTML = document.querySelectorAll('#curplayer');
        let winner_HTML = document.querySelectorAll('#winner');
        winner_HTML.item(0).innerHTML = "Winner = "+this.model.winner;
        rounds.item(0).innerHTML = "Rounds : "+this.roundCounter;
        curplayer_HTML.item(0).innerHTML = "Current Player : "+this.currentPlayer;
    }

    init_playable_case(playable_case_HTML) {
        playable_case_HTML.forEach(playable_case => {
            const clickHandler = () => {
                let tab = Utils.prototype.getCoordinatesFromID(playable_case.id);
                let oldPosition = null;
                    actionGameService.getPlayerPosition(this.currentPlayer,(res)=>{
                        oldPosition = res;
                    });
                    actionGameService.moveCharacter(this.currentPlayer, tab[0], tab[1],(res)=>{
                        if(res){
                            this.view.boardGrid.displayPlayer(tab[0], tab[1], this.currentPlayer);
                            //ON RETIRE L'ANCIEN STYLE
                            this.view.boardGrid.deletePlayer(oldPosition.row.toString(), oldPosition.col.toString(), this.currentPlayer);
                            this.updatePage();
                        }
                    });
            };

            playable_case.addEventListener('click', clickHandler);
        });
    }

}