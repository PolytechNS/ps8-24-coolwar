import {actionGameService} from "../Services/actionGameService.js";
import {getCaseFromCoordinates,getWallNeighborhood,getWallNeighborhood_Invert} from "./BoardGrid/WallManager.js";
import {Utils} from "../Utils/utils.js";

export class GamePresenter {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        console.log("GamePresenter created");
        console.log(this.view);
        window.addEventListener('load', (event) => {
            this.init_behaviour(this.view, this.model);
        });
        this.currentPlayer = 1;
    }

    init_behaviour(view, model) {
        let horizontal_walls_HTML = document.querySelectorAll('.horizontal_hitbox');
        let vertical_walls_HTML = document.querySelectorAll('.vertical_hitbox');
        let playable_case_HTML = document.querySelectorAll('.playable_square');

        const init_walls = (list) => {
            list.forEach((wall) => {
                const hoverHandler = () => {
                    let neighborhood = getWallNeighborhood(wall);
                    if (!actionGameService.isPresentWall(neighborhood)) {

                        this.view.displayWall(neighborhood, 0.8);
                    } else {
                        neighborhood = getWallNeighborhood_Invert(wall);
                        if (!actionGameService.isPresentWall(neighborhood)) {
                            this.view.displayWall(neighborhood, 0.8);
                        }
                    }
                    this.view.displayWall(wall, 0.8);
                };

                const leaveHoverHandler = () => {
                    let neighborhood = getWallNeighborhood(wall);
                    if (!actionGameService.isPresentWall(neighborhood)) {
                        this.view.displayWall(neighborhood, 0);
                    } else {
                        neighborhood = getWallNeighborhood_Invert(wall);
                        if (!actionGameService.isPresentWall(neighborhood)) {
                            this.view.displayWall(neighborhood, 0);
                        }
                    }
                    this.view.displayWall(wall, 0);
                };

                const clickHandler = () => {
                    let neighborhood = getWallNeighborhood(wall);
                    if (actionGameService.isPresentWall(neighborhood)) {
                        neighborhood = getWallNeighborhood_Invert(wall);
                    }
                    let wallList = [wall];
                    if (!actionGameService.isPresentWall(neighborhood)) {
                        wallList.push(neighborhood);
                    }

                    if (actionGameService.placeWall(this.currentPlayer, wallList)) {
                        wallList.forEach((wallToEdit) => {
                            this.view.displayWall(wallToEdit, 1);
                            let replaceOBJ = wallToEdit.cloneNode(true);
                            wallToEdit.replaceWith(replaceOBJ);
                        });
                        updateCurrentPlayer();
                    }
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