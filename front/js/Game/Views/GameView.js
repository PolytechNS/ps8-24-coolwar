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
        console.log(row)
        console.log(col)
        this.boardGrid.updateCharacterPosition(row,col,id)
    }

    displayWall(wall, opacity) {
        wall.children.item(0).style.opacity = opacity;
    }
}
