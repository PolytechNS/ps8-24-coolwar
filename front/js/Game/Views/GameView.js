import { BoardGrid } from './BoardGrid/BoardGrid.js';
export class GameView {
    constructor() {
        this.plateElement = document.querySelector('.plate');
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

    updateViewCharacter(row, col,id){
        console.log("updateDisplayBot JOUEUR ADVERSE")
        this.boardGrid.updateCharacterPosition(row,col,id)
    }

    displayWallHtml(wall, opacity) {
        wall.style.opacity = opacity;
    }

    displayWinner(winner) {
        console.log("displayWinner")
    }

}
