import {actionGameService} from "../../Services/Games/actionGameService.js";
import {gameService} from "../../Services/Games/gameService.js";
import {Utils} from "../../Utils/utils.js";
import {GameBehaviour} from "./GameBehaviour.js";
import {GameView} from "../Views/GameView.js";
import { getWallNeighborhood, getWallNeighborhood_Invert } from "../../Utils/wallUtils.js";

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
        this.roomId=this.model.roomId?this.model.roomId:null;
        this.wallPower = false;
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
       this.init_bonus();
    }

    init_bonus() {
        let bonus_HTML = document.querySelectorAll('#BTN_superpower');
        bonus_HTML.item(0).addEventListener('click', () => {
            if(this.wallPower){
                this.wallPower = false;
                bonus_HTML.item(0).classList.remove('active_bonus');
            }
            else{
                this.wallPower = true;
                bonus_HTML.item(0).classList.add('active_bonus');
            }
        });
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
                const clickHandler = this.clickPlaceWallHandler(wall);

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
             if(!this.gameBehaviour.isPresentWall(neighborhood,this.model)){
                 neighborhood.children.item(0).style.opacity = "0.8";
             }
             else {
                 neighborhood = getWallNeighborhood_Invert(wall);
                 if (!this.gameBehaviour.isPresentWall(neighborhood,this.model)) {
                     neighborhood.children.item(0).style.opacity = "0.8";
                 }
             }
             wall.children.item(0).style.opacity = "0.8";
         }

    };

     leaveHoverHandler = (wall) => {
         return () => {
             let neighborhood = getWallNeighborhood(wall);
             if(!this.gameBehaviour.isPresentWall(neighborhood,this.model)){
                 neighborhood.children.item(0).style.opacity = "0";
             }
             else{
                 neighborhood = getWallNeighborhood_Invert(wall);
                 if(!this.gameBehaviour.isPresentWall(neighborhood,this.model)){
                     neighborhood.children.item(0).style.opacity = "0";
                 }
             }
             wall.children.item(0).style.opacity = "0";
         }

    };

    init_playable_case(playable_case_HTML) {
        playable_case_HTML.forEach(playable_case => {
            const clickMoveHandler = () => {
                //console.log("MODLE WHEN CLICK ON CASE",this.model.currentPlayer);
                let tab = Utils.prototype.getCoordinatesFromID(playable_case.id);
                let oldPosition = null;
                actionGameService.getPlayerPosition(this.model.typeGame,this.model.ownIndexPlayer,this.model.gameId,(res)=>{
                    oldPosition = res;
                });
                //token
                actionGameService.moveCharacter(this.model.typeGame,this.model.ownIndexPlayer, tab[0], tab[1],this.model.gameId,this.model.gameBoardId,localStorage.getItem('token'),this.roomId,(res)=>{
                    if(res){
                        this.view.boardGrid.displayPlayer(tab[0], tab[1], this.model.currentPlayer);
                        //ON RETIRE L'ANCIEN STYLE
                        this.view.boardGrid.deletePlayer(oldPosition.row.toString(), oldPosition.col.toString(), this.model.currentPlayer);
                        this.sendUpdateToBack();
                    }
                });
            };

            playable_case.addEventListener('click', clickMoveHandler);
        });
    }

    clickPlaceWallHandler = (wall) => {
        return () => {
            if(this.wallPower){
                console.log("WALLPOWER -> ORIGINAL WALL :",wall.children.item(0).id);
                const dataToSend = {gameBoardId : this.model.gameBoardId, gameId : this.model.gameId, originalWall : wall.children.item(0).id,roomId:this.roomId,ownIndexPlayer:this.model.ownIndexPlayer,wallPower:this.wallPower };
                actionGameService.explodeWall(this.model.typeGame,dataToSend, (isAuthorized)=>{
                    if(isAuthorized){this.sendUpdateToBack();}
                });
            }
            else{
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
                const dataToSend = {gameBoardId : this.model.gameBoardId, gameId : this.model.gameId, wallList : wallListReq,roomId:this.roomId,ownIndexPlayer:this.model.ownIndexPlayer };
                console.log(" -> ",dataToSend);
                actionGameService.placeWall(this.model.typeGame,dataToSend, (isAuthorized)=>{
                    if(isAuthorized) {
                        //GESTION DES SUPERS-POUVOIRS SUR LES MUR
                        wallListObj.forEach((wallToEdit) => {
                            let wallInside = wallToEdit.children.item(0);
                            this.view.displayWallHtml(wallInside, 1);
                            let replaceOBJ = wallToEdit.cloneNode(true);
                            wallToEdit.replaceWith(replaceOBJ);
                        });
                        this.sendUpdateToBack();
                    }
                });
            }
        }
    };

    checkEndGame(){
        actionGameService.checkWinner(this.model.typeGame,this.model.gameId,(callback)=>{
            console.log(callback);
            if(callback===1  || callback===2){
                let winner_HTML = document.querySelectorAll('#winner');
                winner_HTML.item(0).innerHTML = "Winner = "+callback;
                this.cancel_behaviour();
            }
        });
    }

    sendUpdateToBack() {
        let informationsData = [this.model.typeGame,this.model.currentPlayer,this.model.gameId];
        actionGameService.updateGameModel(informationsData,(newModel)=>{
            this.updateModel(newModel);
        });
    }

    updateModel(newModel){
        this.model = JSON.parse(newModel);
        document.querySelectorAll('#plate').item(0).innerHTML='';
        this.view.initializeBoardGrid(this.model);
        this.view.initializeGrid(this.model);
        this.init_behaviour(this.model);

        console.log("MODEL AFTER UPDATE",this.model);
        this.view.updateViewCharacter(this.model.player_array[0].position.row,this.model.player_array[0].position.col,1);
        if(this.model.player_array[1]!=null){this.view.updateViewCharacter(this.model.player_array[1].position.row,this.model.player_array[1].position.col,2);}

        //UPDATE LES MURS
        let horizontalWalls_in_gameModel = this.model.horizontal_Walls;
        let verticalWalls_in_gameModel = this.model.vertical_Walls;

        let horizontalWalls_in_HTML = document.querySelectorAll('.horizontal_hitbox');
        let verticalWalls_in_HTML = document.querySelectorAll('.vertical_hitbox');

        //ON PARCOURS LES MURS DU MODEL
        for(let i=0;i<horizontalWalls_in_gameModel.length;i++){
            let wall = horizontalWalls_in_gameModel[i];
            //ON PARCOURS LES MURS DU HTML
            horizontalWalls_in_HTML.forEach((hitboxHTML)=>{
                let wallHTML = hitboxHTML.children.item(0);
                const hoverHandler = this.hoverHandler(hitboxHTML);
                const leaveHoverHandler = this.leaveHoverHandler(hitboxHTML);
                const clickHandler = this.clickPlaceWallHandler(hitboxHTML);
                let position = wallHTML.id.split('X');
                //SI LE MUR EXISTE ET QU'IL EST PRESENT
               if(parseInt(position[0])===parseInt(wall.position.row) && parseInt(position[1])===parseInt(wall.position.col) && position[2]===wall.type && wall.isPresent===true){
                   //ON L'AFFICHE ET ON LUI RETIRE SES COMPORTEMENTS
                   console.log("PRESENT WALL", wall.position.row, wall.position.col, wall.type, wall.isPresent);
                   this.view.displayWallHtml(wallHTML,1);
                   let replaceOBJ = hitboxHTML.cloneNode(true);
                   hitboxHTML.replaceWith(replaceOBJ);
               }
            });
        }
        for(let i=0;i<verticalWalls_in_gameModel.length;i++){
            let wall = verticalWalls_in_gameModel[i];
            verticalWalls_in_HTML.forEach((hitboxHTML)=>{
                let wallHTML = hitboxHTML.children.item(0);
                const hoverHandler = this.hoverHandler(hitboxHTML);
                const leaveHoverHandler = this.leaveHoverHandler(hitboxHTML);
                const clickHandler = this.clickPlaceWallHandler(hitboxHTML);
                let position = wallHTML.id.split('X');
                if(parseInt(position[0])===parseInt(wall.position.row) && parseInt(position[1])===parseInt(wall.position.col) && position[2]===wall.type && wall.isPresent===true){
                    console.log("PRESENT WALL", wall.position.row, wall.position.col, wall.type, wall.isPresent);
                    this.view.displayWallHtml(wallHTML,1);
                    let replaceOBJ = hitboxHTML.cloneNode(true);
                    hitboxHTML.replaceWith(replaceOBJ);
                }
            });
        }
        this.checkEndGame();
        this.updateInformations();
    }
    updateInformations(){
        console.log("-----UPDATE INFORMATIONS-----");
        let playable_case_HTML = document.querySelectorAll('.playable_square');
        //update des couleurs des cases
        playable_case_HTML.forEach(playable_case => {
            let position = playable_case.id.split('X');
            for(let i=0;i<this.model.playable_squares.length;i++){
                let backSquare = this.model.playable_squares[i];
                if(parseInt(backSquare.position.row)===parseInt(position[0]) && parseInt(backSquare.position.col)===parseInt(position[1])) {
                    playable_case.innerHTML = "<p>"+backSquare.visibility+"</p>";
                    playable_case.style.color = "white";
                    if(backSquare.visibility <0) {
                        playable_case.style.backgroundColor = "#22341A";
                    }
                    if(backSquare.visibility > 0){
                        playable_case.style.backgroundColor = "#497637";
                    }
                    if(backSquare.visibility === 0) {
                        playable_case.style.backgroundColor = "#5E8C61";
                    }
                }
            }
        });
        let whoIAm = document.querySelectorAll('#playerID');
        let rounds = document.querySelectorAll('#rounds');
        let curplayer_HTML = document.querySelectorAll('#curplayer');
        let nbWallsLeft_HTML = document.querySelectorAll('#nbWallsLeft');
        console.log(this.model.ownIndexPlayer);
        console.log(this.model.currentPlayer);
        rounds.item(0).innerHTML = "Rounds : "+this.model.roundCounter;

        curplayer_HTML.item(0).innerHTML = this.model.player_array[this.model.currentPlayer -1].name;
        console.log("-----------------------UPDATE NB WALLS-----------------------");
        console.log("OWN INDEX PLAYER -> ",this.model.ownIndexPlayer);

        if(this.model.player_array.length<=1){
            nbWallsLeft_HTML.item(0).innerHTML = this.model.player_array[0].nbWalls + " walls left";
        }
        else{
            nbWallsLeft_HTML.item(0).innerHTML = this.model.player_array[this.model.ownIndexPlayer-1].nbWalls + " walls left";
        }

        console.log("-------------------------------------------------------------")
        whoIAm.item(0).innerHTML = "You are player "+this.model.ownIndexPlayer;
    }



}
