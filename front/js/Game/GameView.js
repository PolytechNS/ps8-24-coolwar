import { BoardGrid } from './BoardGrid/BoardGrid.js';
export class GameView {
    constructor(model) {
        this.plateElement = document.querySelector('.plate');
        this.boardGrid = new BoardGrid(model);
        this.nbLignes = this.boardGrid.nbLignes;
        this.nbColonnes = this.boardGrid.nbColonnes;
        this.nbPlayers = model.nbPlayers;
        this.initializeGrid(model);
    }

    initializeGrid(model) {
        // Logique pour initialiser le plateau de jeu dans le DOM
        this.boardGrid.createGrid(model);
    }

    updateBoard(board) {
        // Mettre à jour le plateau
    }

    displayWall(wall, opacity) {
        console.log("dans display wall")
        console.log(wall);
        wall.children.item(0).style.opacity = opacity;
    }
}
