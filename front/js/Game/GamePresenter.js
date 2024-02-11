import {ActionController} from "../../../back/logic/Controller/actionController.js";
import {Utils} from "../Utils/utils.js";

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
        this.actionController=new ActionController(model);
        this.view = view;
        this.model = model;
        window.addEventListener('load', (event) => {
            this.init_behaviour();
            this.updateRounds();
        });
        this.currentPlayer = this.model.currentPlayer;
    };

    init_behaviour() {
        let horizontal_walls_HTML = document.querySelectorAll('.horizontal_hitbox');
        let vertical_walls_HTML = document.querySelectorAll('.vertical_hitbox');
        let playable_case_HTML = document.querySelectorAll('.playable_square')

       this.init_walls(horizontal_walls_HTML);
       this.init_walls(vertical_walls_HTML);
       this.init_playable_case(playable_case_HTML);
    }

    init_walls(list){
        list.forEach((wall)=> {
            const hoverHandler = () => {
                let neighborhood = getWallNeighborhood(wall);
                if(!this.actionController.isPresentWall(neighborhood)){
                    neighborhood.children.item(0).style.opacity = "0.8";
                }
                else {
                    neighborhood = getWallNeighborhood_Invert(wall);
                    if (!this.actionController.isPresentWall(neighborhood)) {
                        neighborhood.children.item(0).style.opacity = "0.8";
                    }
                }
                wall.children.item(0).style.opacity = "0.8";
            };

            const leaveHoverHandler = () => {
                let neighborhood = getWallNeighborhood(wall);
                if(!this.actionController.isPresentWall(neighborhood)){
                    neighborhood.children.item(0).style.opacity = "0";
                }
                else{
                    neighborhood = getWallNeighborhood_Invert(wall);
                    if(!this.actionController.isPresentWall(neighborhood)){
                        neighborhood.children.item(0).style.opacity = "0";
                    }
                }
                wall.children.item(0).style.opacity = "0";
            };

            const clickHandler = () => {
                //ENVOIE DE L'ACTION AU BACK AVEC 'isPlacable()'
                let neighborhood = getWallNeighborhood(wall);
                if(this.actionController.isPresentWall(neighborhood)){
                    neighborhood = getWallNeighborhood_Invert(wall);
                }
                let wallList = [wall];
                if(!this.actionController.isPresentWall(neighborhood)){wallList.push(neighborhood);}

                //CALL BD - PLACER UN MUR
                if(this.actionController.placeWall(this.currentPlayer,wallList)){
                    wallList.forEach(wallToEdit=>{
                        wallToEdit.children.item(0).style.opacity = "1";
                        let replaceOBJ = wallToEdit.cloneNode(true);
                        wallToEdit.replaceWith(replaceOBJ);
                    });
                    this.updatePage();
                }
            };

            wall.addEventListener('mouseenter', hoverHandler);
            wall.addEventListener('mouseleave', leaveHoverHandler);
            wall.addEventListener('click', clickHandler);
        });
    }

    updatePage() {
        if(this.currentPlayer === 1) { this.currentPlayer = 2; }
        else if(this.currentPlayer === 2) { this.currentPlayer = 1; }
        else { }
        this.updateRounds();
    }

    updateRounds(){
        let rounds = document.querySelectorAll('#rounds');
        let curplayer_HTML = document.querySelectorAll('#curplayer');
        rounds.item(0).innerHTML = "Rounds : "+this.model.roundCounter;
        curplayer_HTML.item(0).innerHTML = "Current Player : "+this.model.currentPlayer;
    }

    init_playable_case(playable_case_HTML) {
        playable_case_HTML.forEach(playable_case => {
            const clickHandler = () => {
                let tab = Utils.prototype.getCoordinatesFromID(playable_case.id);
                //CALL BD
                if(this.actionController.characterCanBeMoved(tab[0], tab[1], this.model.player_array.getPlayerPosition(this.currentPlayer))){
                    let oldPosition = this.model.player_array.getPlayerPosition(this.currentPlayer);
                    let caseToAlter = getCaseFromCoordinates(oldPosition.row, oldPosition.col);
                    if(this.actionController.moveCharacter(this.currentPlayer, tab[0], tab[1])){
                        //ON DEPLACE LE PERSONNAGE
                        this.view.boardGrid.displayPlayer(tab[0], tab[1], this.currentPlayer);
                        //ON RETIRE L'ANCIEN STYLE
                        this.view.boardGrid.deletePlayer(oldPosition.row.toString(), oldPosition.col.toString(), this.currentPlayer);
                    }
                    this.updatePage();
                }
            };

            playable_case.addEventListener('click', clickHandler);
        });
    }

}