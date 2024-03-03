import { BoardGrid } from './BoardGrid/BoardGrid.js';
export class GameView {
    constructor() {
        this.boardGrid = null;
    }

    initializeBoardGrid(model) {
        // Logique pour initialiser le plateau de jeu dans le DOM
        this.boardGrid = new BoardGrid(model);
    }
    initializeGrid(model) {
        // Logique pour initialiser le plateau de jeu dans le DOM
        this.boardGrid.createGrid(model);
    }

    updateBoard(board) {
        // Mettre à jour le plateau
    }

    updateDisplayBot(row,col){
        this.boardGrid.updateBotPosition(row,col,2)
    }

    displayWall(wall, opacity) {
        wall.children.item(0).style.opacity = opacity;
    }
}
