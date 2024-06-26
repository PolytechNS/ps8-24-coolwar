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
        this.wallIsSelected = false;
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
        console.log("INIT BEHAVIOUR");
        let horizontal_walls_HTML = document.querySelectorAll('.horizontal_hitbox');
        let vertical_walls_HTML = document.querySelectorAll('.vertical_hitbox');
        let playable_case_HTML = document.querySelectorAll('.playable_square');


       this.init_walls(horizontal_walls_HTML, model);
       this.init_walls(vertical_walls_HTML,model);
       this.init_playable_case(playable_case_HTML);
       this.initValidationBtn();
       if(this.model.typeGame === "withFriends"){this.init_bonus();}
    }

    initValidationBtn(){
        // Les boutons sont déjà dans le DOM, on ne change que leur comportement
        const confirmButton = document.getElementById("confirmMove");
        const cancelButton = document.getElementById("cancelMove");

        confirmButton.onclick = () => {
            console.log("Confirm button clicked");
            console.log(confirmButton.classList);
            if(!confirmButton.classList.contains('active_BTN_SELECTION')){alert("You must select a move before confirming !");}
        }
        cancelButton.onclick = () => {
            console.log("Cancel button clicked");
            if(!cancelButton.classList.contains('active_BTN_SELECTION')){alert("You must select a move before canceling !");}
        }
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
        console.log("INIT WALLS");

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
             if(!this.wallIsSelected){
                 let neighborhood = getWallNeighborhood(wall);
                 console.log("NEIGHBORHOOD -> ",neighborhood);
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
         }

    };

     leaveHoverHandler = (wall) => {
         return () => {
             if(!this.wallIsSelected){
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
         }

    };

    init_playable_case(playable_case_HTML) {
        playable_case_HTML.forEach(playable_case => {
            const clickMoveHandler = () => {
                //console.log("MODLE WHEN CLICK ON CASE",this.model.currentPlayer);
                let tab = Utils.prototype.getCoordinatesFromID(playable_case.id);
                let oldPosition = null;
                let originalBackGroundColor = playable_case.style.backgroundColor;
                //Affichage de la position selectionnée
                playable_case.style.backgroundColor = "red";

                //Affichage des boutons de Confirmations/Annulation
                this.showConfirmationButtons();

                function waitForUserAction() {
                    return new Promise((resolve, reject) => {
                        // Les boutons sont déjà dans le DOM, on ne change que leur comportement
                        const confirmButton = document.getElementById("confirmMove");
                        const cancelButton = document.getElementById("cancelMove");

                        // Gestionnaires d'événements pour résoudre la promesse
                        confirmButton.onclick = () => resolve(true);
                        cancelButton.onclick = () => resolve(false);
                    });
                }
                async function handleUserAction() {
                    try {
                        const userConfirmed = await waitForUserAction();
                        console.log("Choix de l'utilisateur :", userConfirmed ? "Confirmé" : "Annulé");
                        // Logique de traitement basée sur la confirmation ou l'annulation par l'utilisateur
                        return userConfirmed; // Retourne le choix de l'utilisateur
                    } catch (error) {
                        console.error("Une erreur s'est produite:", error);
                    }
                }

                // Exemple d'utilisation
                handleUserAction().then((userConfirmed) => {
                    if (userConfirmed) {
                        actionGameService.getPlayerPosition(this.model.typeGame,this.model.ownIndexPlayer,this.model.gameId,(res)=>{
                            oldPosition = res;
                        });
                        //token
                        actionGameService.moveCharacter(this.model.typeGame,this.model.ownIndexPlayer, tab[0], tab[1],this.model.gameId,this.model.gameBoardId,localStorage.getItem('token'),this.roomId,(res)=>{
                            if(res){
                                document.addEventListener('deviceready', () => {
                                    console.log("Device ready");

                                    // Définir le chemin vers le fichier sonore
                                    var mediaUrl = '/android_asset/www/assets/audio/foot.mp3';

                                    // Créer l'objet Media une seule fois après que l'appareil est prêt
                                    var clickSound = new Media(mediaUrl, function onSuccess() {
                                        // Succès lors de la lecture du son
                                        console.log("Audio played successfully");
                                    }, function onError(error) {
                                        // Erreur lors de la lecture du son
                                        console.error("Error playing audio: " + error.code + " - " + error.message);
                                    });
                                    clickSound.play();
                                    navigator.vibrate(1000); // Vibre pendant 2000 millisecondes (2 secondes)

                                });
                                this.view.boardGrid.displayPlayer(tab[0], tab[1], this.model.currentPlayer);
                                //ON RETIRE L'ANCIEN STYLE
                                this.view.boardGrid.deletePlayer(oldPosition.row.toString(), oldPosition.col.toString(), this.model.currentPlayer);
                                this.sendUpdateToBack();
                            }
                        });
                    } else {}
                    playable_case.style.backgroundColor = originalBackGroundColor;
                    this.hideConfirmationButtons();
                });
            };
            playable_case.addEventListener('click', clickMoveHandler);
        });
    }

    clickPlaceWallHandler = (wall) => {
        return () => {
            if(this.wallPower){
                //VALIDATION DE L'ACTION (previsualisation de l'explosion)
                this.showConfirmationButtons();
                function waitForUserAction() {
                    return new Promise((resolve, reject) => {
                        // Les boutons sont déjà dans le DOM, on ne change que leur comportement
                        const confirmButton = document.getElementById("confirmMove");
                        const cancelButton = document.getElementById("cancelMove");

                        // Gestionnaires d'événements pour résoudre la promesse
                        confirmButton.onclick = () => {
                            navigator.vibrate(1000); // Vibre pendant 2000 millisecondes (2 secondes)
                            resolve(true);
                        };
                        cancelButton.onclick = () => {
                            navigator.vibrate(1000); // Vibre pendant 2000 millisecondes (2 secondes)
                            resolve(false);
                        };
                    });
                }
                async function handleUserAction() {
                    try {
                        const userConfirmed = await waitForUserAction();
                        console.log("Choix de l'utilisateur :", userConfirmed ? "Confirmé" : "Annulé");
                        // Logique de traitement basée sur la confirmation ou l'annulation par l'utilisateur
                        return userConfirmed; // Retourne le choix de l'utilisateur
                    } catch (error) {
                        console.error("Une erreur s'est produite:", error);
                    }
                }
                handleUserAction().then((userConfirmed) => {
                    if(userConfirmed){
                        console.log("WALLPOWER -> ORIGINAL WALL :",wall.children.item(0).id);
                        const dataToSend = {gameBoardId : this.model.gameBoardId, gameId : this.model.gameId, originalWall : wall.children.item(0).id,roomId:this.roomId,ownIndexPlayer:this.model.ownIndexPlayer,wallPower:this.wallPower };
                        actionGameService.explodeWall(this.model.typeGame,dataToSend, (isAuthorized)=>{
                            if(isAuthorized){
                                this.sendUpdateToBack();
                                document.addEventListener('deviceready', () => {
                                    console.log("Device ready");

                                    // Définir le chemin vers le fichier sonore
                                    var mediaUrl = '/android_asset/www/assets/audio/explosion.wav';

                                    // Créer l'objet Media une seule fois après que l'appareil est prêt
                                    var clickSound = new Media(mediaUrl, function onSuccess() {
                                        // Succès lors de la lecture du son
                                        console.log("Audio played successfully");
                                    }, function onError(error) {
                                        // Erreur lors de la lecture du son
                                        console.error("Error playing audio: " + error.code + " - " + error.message);
                                    });
                                    clickSound.play();

                                });
                                // Ici, l'animation d'explosion est déclenchée
                                /*const explodeElement = document.createElement('div');
                                explodeElement.classList.add('explode');
                                document.body.appendChild(explodeElement);

                                // Positionner l'explosion correctement
                                explodeElement.style.left = `${event.clientX - 50}px`; // Centre l'explosion par rapport au clic
                                explodeElement.style.top = `${event.clientY - 50}px`;

                                // Supprimer l'élément après l'animation
                                setTimeout(() => {
                                    explodeElement.remove();
                                }, 500); // Correspond à la durée de l'animation
                                */
                            }
                        });
                    }
                    this.hideConfirmationButtons();
                    this.wallIsSelected = false;
                });
            }
            else{
                //VALIDATION DE L'ACTION (previsualisation du placement des murs)
                this.showConfirmationButtons();
                //on previent le handler de survol que le mur est selectionné
                this.wallIsSelected = true;
                function waitForUserAction() {
                    return new Promise((resolve, reject) => {
                        // Les boutons sont déjà dans le DOM, on ne change que leur comportement
                        const confirmButton = document.getElementById("confirmMove");
                        const cancelButton = document.getElementById("cancelMove");

                        // Gestionnaires d'événements pour résoudre la promesse
                        confirmButton.onclick = () => {
                            navigator.vibrate(1000); // Vibre pendant 2000 millisecondes (2 secondes)
                            resolve(true);
                        };
                        cancelButton.onclick = () => {
                            navigator.vibrate(1000); // Vibre pendant 2000 millisecondes (2 secondes)
                            resolve(false);
                        };
                    });
                }
                async function handleUserAction() {
                    try {
                        const userConfirmed = await waitForUserAction();
                        console.log("Choix de l'utilisateur :", userConfirmed ? "Confirmé" : "Annulé");
                        // Logique de traitement basée sur la confirmation ou l'annulation par l'utilisateur
                        return userConfirmed; // Retourne le choix de l'utilisateur
                    } catch (error) {
                        console.error("Une erreur s'est produite:", error);
                    }
                }
                //Attente de la confirmation de l'utilisateur
                handleUserAction().then((userConfirmed) => {
                    if(userConfirmed){
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
                                document.addEventListener('deviceready', () => {
                                    console.log("Device ready");

                                    // Définir le chemin vers le fichier sonore
                                    var mediaUrl = '/android_asset/www/assets/audio/wall.wav';

                                    // Créer l'objet Media une seule fois après que l'appareil est prêt
                                    var clickSound = new Media(mediaUrl, function onSuccess() {
                                        // Succès lors de la lecture du son
                                        console.log("Audio played successfully");
                                    }, function onError(error) {
                                        // Erreur lors de la lecture du son
                                        console.error("Error playing audio: " + error.code + " - " + error.message);
                                    });
                                    clickSound.play();

                                });
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
                    this.hideConfirmationButtons();
                    this.wallIsSelected = false;
                });
            }
        }
    };

    checkEndGame(){
        console.log("CHECK END GAME");
        actionGameService.checkWinner(this.model.typeGame,this.model.gameId,(callback)=>{
            console.log(callback);
            if(callback===1  || callback===2){
                document.addEventListener('deviceready', () => {
                    console.log("Device ready");

                    if(this.model.ownIndexPlayer===callback){
                        var mediaUrl = '/android_asset/www/assets/audio/victory.mp3';

                    }else{
                        var mediaUrl = '/android_asset/www/assets/audio/loose.mp3';

                    }
                    // Définir le chemin vers le fichier sonore

                    // Créer l'objet Media une seule fois après que l'appareil est prêt
                    var clickSound = new Media(mediaUrl, function onSuccess() {
                        // Succès lors de la lecture du son
                        console.log("Audio played successfully");
                    }, function onError(error) {
                        // Erreur lors de la lecture du son
                        console.error("Error playing audio: " + error.code + " - " + error.message);
                    });
                    clickSound.play();

                });
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
        console.log("NEW GAME MODEL RECIEVED !",newModel);
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
        this.hideConfirmationButtons();
        console.log("-----UPDATE INFORMATIONS-----");
        let playable_case_HTML = document.querySelectorAll('.playable_square');
        //update des couleurs des cases
        playable_case_HTML.forEach(playable_case => {
            let position = playable_case.id.split('X');
            for(let i=0;i<this.model.playable_squares.length;i++){
                let backSquare = this.model.playable_squares[i];
                if(parseInt(backSquare.position.row)===parseInt(position[0]) && parseInt(backSquare.position.col)===parseInt(position[1])) {
                    //playable_case.innerHTML = "<p>"+backSquare.visibility+"</p>";
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
        let nbWallsLeft_mobile = document.querySelectorAll('#nbWallsLeftMobile');

        rounds.item(0).innerHTML = "Rounds : "+this.model.roundCounter;

        if(this.model.ownIndexPlayer !== this.model.currentPlayer){
            curplayer_HTML.item(0).innerHTML = "Ennemy";
        }
        else{
            curplayer_HTML.item(0).innerHTML = "You";
        }

        console.log("-----------------------UPDATE NB WALLS-----------------------");
        console.log("OWN INDEX PLAYER -> ",this.model.ownIndexPlayer);

        if(this.model.player_array.length<=1){
            nbWallsLeft_HTML.item(0).innerHTML = this.model.player_array[0].nbWalls + " walls left";
            nbWallsLeft_mobile.item(0).innerHTML = this.model.player_array[0].nbWalls + " walls left";
        }
        else{
            nbWallsLeft_HTML.item(0).innerHTML = this.model.player_array[this.model.ownIndexPlayer-1].nbWalls + " walls left";
            nbWallsLeft_mobile.item(0).innerHTML = this.model.player_array[this.model.ownIndexPlayer-1].nbWalls + " walls left";
        }

        console.log("-------------------------------------------------------------")
        whoIAm.item(0).innerHTML = "You are player "+this.model.ownIndexPlayer;
    }

    showConfirmationButtons() {
        console.log("SHOW CONFIRMATION BUTTONS");
        // Les boutons sont déjà dans le DOM, on ne change que leur comportement
        const confirmButton = document.getElementById("confirmMove");
        const cancelButton = document.getElementById("cancelMove");

        confirmButton.classList.add('active_BTN_SELECTION');
        cancelButton.classList.add('active_BTN_SELECTION');
        confirmButton.classList.remove('inactive_BTN_SELECTION');
        cancelButton.classList.remove('inactive_BTN_SELECTION');
    }
    hideConfirmationButtons() {
        console.log("SHOW CONFIRMATION BUTTONS");
        // Les boutons sont déjà dans le DOM, on ne change que leur comportement
        const confirmButton = document.getElementById("confirmMove");
        const cancelButton = document.getElementById("cancelMove");

        confirmButton.classList.remove('active_BTN_SELECTION');
        cancelButton.classList.remove('active_BTN_SELECTION');
        confirmButton.classList.add('inactive_BTN_SELECTION');
        cancelButton.classList.add('inactive_BTN_SELECTION');
    }
}



