import { BoardGrid } from './BoardGrid/BoardGrid.js';
export class GameView {
    constructor() {
        this.plateElement = document.querySelector('.plate');
        console.log(this.plateElement);
        console.log("in GameView constructor");
        this.boardGrid = new BoardGrid();

        this.initializeGrid();
    }

    initializeGrid() {
        // Logique pour initialiser le plateau de jeu dans le DOM
        this.boardGrid.createGrid();


    }

    updateBoard(board) {
        // Mettre à jour le plateau
    }
}
