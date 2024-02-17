import {actionGameService} from "../Services/actionGameService.js";
import {gameService} from "../Services/gameService.js";
import {Utils} from "../Utils/utils.js";
import {GameBehaviour} from "./GameBehaviour.js";
import {GameView} from "./GameView.js";

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

export class GamePresenter {
    constructor(model, view) {
        this.view = view;
        this.model = model;
        this.view.initializeBoardGrid(model); //création de l'objet
        this.view.initializeGrid(model); //création du plateau
        this.eventHandlers = {};
        this.init_behaviour(this.model);
        this.updateInformations();
        this.gameBehaviour = new GameBehaviour();
        this.attachSaveHandler();
        this.detachHandlerFromWalls();
    }

    detachHandlerFromWalls() {
        // Suppression des gestionnaires d'événements pour les murs horizontaux
        this.model.horizontal_Walls.forEach((wall) => {
            if (wall.isPresent) {
                const wallId = wall.position.row.toString() + "X" + wall.position.col.toString() + "X" + 'H';
                this.replaceWallElement(wallId);
            }
        });

        // Suppression des gestionnaires d'événements pour les murs verticaux
        this.model.vertical_Walls.forEach((wall) => {
            if (wall.isPresent) {
                const wallId = wall.position.row.toString() + "X" + wall.position.col.toString() + "X" + 'V';
                this.replaceWallElement(wallId);
            }
        });
    }

    replaceWallElement(wallId) {
        const wallHTML = document.getElementById(wallId);
        if (wallHTML) {
            console.log('Replacing wall element with id: ' + wallId);
            const clone = wallHTML.cloneNode(true);
            wallHTML.replaceWith(clone);
        }
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

    init_behaviour(model) {
        let horizontal_walls_HTML = document.querySelectorAll('.horizontal_hitbox');
        let vertical_walls_HTML = document.querySelectorAll('.vertical_hitbox');
        let playable_case_HTML = document.querySelectorAll('.playable_square');

       this.init_walls(horizontal_walls_HTML, model);
       this.init_walls(vertical_walls_HTML,model);
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

    init_walls(list, model){

        list.forEach((wall)=> {
            let wallModel = null;

            model.horizontal_Walls.forEach((wallModelToCheck)=>{
                let idWallHTML = wall.children.item(0).id;
                let idWallModel = wallModelToCheck.position.row.toString() + "X" + wallModelToCheck.position.col.toString() + "X" + 'H';
                if(idWallHTML === idWallModel){
                    wallModel = wallModelToCheck;
                }
            });
            model.vertical_Walls.forEach((wallModelToCheck)=>{
                let idWallHTML = wall.children.item(0).id;
                let idWallModel = wallModelToCheck.position.row.toString() + "X" + wallModelToCheck.position.col.toString() + "X" + 'V';
                if(idWallHTML === idWallModel){
                    wallModel = wallModelToCheck;
                }
            });

            if(!wallModel.isPresent){
                const hoverHandler = this.hoverHandler(wall);
                const leaveHoverHandler = this.leaveHoverHandler(wall);
                const clickHandler = this.clickHandler(wall);

                // Attache les gestionnaires d'événements
                wall.addEventListener('mouseenter', hoverHandler);
                wall.addEventListener('mouseleave', leaveHoverHandler);
                wall.addEventListener('click', clickHandler);

                // Stocke les références pour pouvoir les supprimer plus tard
                this.eventHandlers[wall.id] = { hoverHandler, leaveHoverHandler, clickHandler };
            }

        });
    }

     hoverHandler = (wall) => {
         return () => {
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
         }

    };

     leaveHoverHandler = (wall) => {
         return () => {
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
         }

    };

    clickHandler = (wall) => {
        return () => {
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

            const dataToSend = {gameBoardId : this.model.gameBoardId, gameId : this.model.gameId, wallList : wallListReq};
            //CALL BD -
            actionGameService.placeWall(dataToSend, (isAuthorized)=>{
                if(isAuthorized){
                    wallListObj.forEach((wallToEdit) => {
                        this.view.displayWall(wallToEdit, 1);
                        let replaceOBJ = wallToEdit.cloneNode(true);
                        wallToEdit.replaceWith(replaceOBJ);
                    });
                    this.updatePage();
                }

            });
        }

    };

    checkEndGame(){
        actionGameService.checkWinner((callback)=>{
            console.log(callback);
            if(callback!==-1){this.cancel_behaviour();}
        });
    }
    updatePage() {
        console.log("UPDATE AFTER ACTION  !!");
        let informationsData = [this.model.currentPlayer,this.model.gameId];
        actionGameService.updateGameModel(informationsData,(newModel)=>{
            this.model = JSON.parse(newModel);
            console.log("CURR PLAYER AFTER UPDATE MODEL : ",this.model.currentPlayer);
            this.checkEndGame();
            this.updateInformations();
        });
    }
    updateInformations(){
        console.log("-----UPDATE INFORMATIONS-----");
        let playable_case_HTML = document.querySelectorAll('.playable_square');
        playable_case_HTML.forEach(playable_case => {
            let position = playable_case.id.split('X');
            for(let i=0;i<this.model.playable_squares.length;i++){
                let backSquare = this.model.playable_squares[i];
                if(parseInt(backSquare.position.row)===parseInt(position[0]) && parseInt(backSquare.position.col)===parseInt(position[1])) {
                    playable_case.innerHTML = "<p>"+backSquare.visibility+"</p>";
                    playable_case.style.color = "white";
                }
            }
        });

        let rounds = document.querySelectorAll('#rounds');
        let curplayer_HTML = document.querySelectorAll('#curplayer');
        let winner_HTML = document.querySelectorAll('#winner');
        winner_HTML.item(0).innerHTML = "Winner = "+this.model.winner.toString();
        rounds.item(0).innerHTML = "Rounds : "+this.model.roundCounter;
        curplayer_HTML.item(0).innerHTML = "Current Player : "+this.model.currentPlayer;
    }

    init_playable_case(playable_case_HTML) {
        playable_case_HTML.forEach(playable_case => {
            const clickHandler = () => {
                //console.log("MODLE WHEN CLICK ON CASE",this.model.currentPlayer);
                let tab = Utils.prototype.getCoordinatesFromID(playable_case.id);
                let oldPosition = null;
                    actionGameService.getPlayerPosition(this.model.currentPlayer,(res)=>{
                        oldPosition = res;
                    });
                    //token
                    actionGameService.moveCharacter(this.model.currentPlayer, tab[0], tab[1],this.model.gameId,localStorage.getItem('token'),(res)=>{
                        if(res){
                            this.view.boardGrid.displayPlayer(tab[0], tab[1], this.model.currentPlayer);
                            //ON RETIRE L'ANCIEN STYLE
                            this.view.boardGrid.deletePlayer(oldPosition.row.toString(), oldPosition.col.toString(), this.model.currentPlayer);
                            this.updatePage();
                        }
                    });
            };

            playable_case.addEventListener('click', clickHandler);
        });
    }

}