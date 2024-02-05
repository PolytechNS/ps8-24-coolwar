import { BoardGrid } from './BoardGrid/BoardGrid.js';
export class GameView {
    constructor() {
        this.DOM = document;
        this.plateElement = document.querySelector('.plate');
        console.log(this.plateElement);
        console.log("in GameView constructor");
        this.boardGrid = new BoardGrid();
        this.nbLignes = this.boardGrid.nbLignes;
        this.nbColonnes = this.boardGrid.nbColonnes;
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
