import {actionGameService} from "../Services/actionGameService.js";
import {getCaseFromCoordinates,getWallNeighborhood,getWallNeighborhood_Invert} from "./BoardGrid/WallManager.js";
import {Utils} from "../Utils/utils.js";
import {GameBehaviour} from "./GameBehaviour.js";

export class GamePresenter {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.init_behaviour(view, model);
        this.gameBehaviour = new GameBehaviour();
        console.log("GamePresenter created");
    }

    init_behaviour(view, model) {
        let horizontal_walls_HTML = document.querySelectorAll('.horizontal_hitbox');
        let vertical_walls_HTML = document.querySelectorAll('.vertical_hitbox');
        let playable_case_HTML = document.querySelectorAll('.playable_square');

        const init_walls = (list) => {
            console.log("INIT WALLS");
            list.forEach((wall) => {
                const hoverHandler = () => {
                    let neighborhood = getWallNeighborhood(wall);
                    if (!this.gameBehaviour.isPresentWall(neighborhood,this.model)) {
                        this.view.displayWall(neighborhood, 0.8);
                    } else {
                        neighborhood = getWallNeighborhood_Invert(wall);
                        if (!this.gameBehaviour.isPresentWall(neighborhood,this.model)) {
                            this.view.displayWall(neighborhood, 0.8);
                        }
                    }
                    this.view.displayWall(wall, 0.8);
                };

                const leaveHoverHandler = () => {
                    let neighborhood = getWallNeighborhood(wall);
                    if (!this.gameBehaviour.isPresentWall(neighborhood,this.model)) {
                        this.view.displayWall(neighborhood, 0);
                    } else {
                        neighborhood = getWallNeighborhood_Invert(wall);
                        if (!this.gameBehaviour.isPresentWall(neighborhood,this.model)) {
                            this.view.displayWall(neighborhood, 0);
                        }
                    }
                    this.view.displayWall(wall, 0);
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
                        console.log(res);
                        wallListObj.forEach((wallToEdit) => {
                            this.view.displayWall(wallToEdit, 1);
                            let replaceOBJ = wallToEdit.cloneNode(true);
                            wallToEdit.replaceWith(replaceOBJ);
                        });
                        updateCurrentPlayer();
                    });
                };

                wall.addEventListener('mouseenter', hoverHandler);
                wall.addEventListener('mouseleave', leaveHoverHandler);
                wall.addEventListener('click', clickHandler);
            });
        };

        init_walls(horizontal_walls_HTML);
        init_walls(vertical_walls_HTML);

        playable_case_HTML.forEach((playable_case) => {
            const clickHandler = () => {
                let tab = Utils.prototype.getCoordinatesFromID(playable_case.id);
                if (actionGameService.characterCanBeMoved(tab[0], tab[1])) {
                    let oldPosition = model.player_array.getPlayerPosition(this.currentPlayer);
                    let caseToAlter = getCaseFromCoordinates(oldPosition.row, oldPosition.col);
                    if (actionGameService.moveCharacter(this.currentPlayer, tab[0], tab[1])) {
                        this.view.boardGrid.displayPlayer(tab[0], tab[1], this.currentPlayer);
                        this.view.boardGrid.deletePlayer(oldPosition.row.toString(), oldPosition.col.toString(), this.currentPlayer);
                    }
                    updateCurrentPlayer();
                }
            };
            playable_case.addEventListener('click', clickHandler);
        });


        function updateCurrentPlayer() {
            /*if(currentPlayer_inside===1){currentPlayer_inside=2;}
            else if(currentPlayer_inside===2){currentPlayer_inside=1;}
            else{}
            console.log("After next Player : "+currentPlayer_inside);
            */
        }
    }
}