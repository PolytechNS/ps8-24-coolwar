import {WallDictionary} from "../Objects/WallDictionary.js";
import {PlayableSquareDictionary} from "../Objects/PlayableSquareDictionary.js";

const horizontal_Walls = new WallDictionary();
const vertical_Walls = new WallDictionary();
const playable_squares = new PlayableSquareDictionary();

export class GameModel {

    constructor(view) {
        // Initialisez votre grille ici, cela peut être un tableau 2D par exemple.
        this.grid = this.createInitialGrid(9, 9); // Pour une grille 9x9
        this.playerPosition = { x: 0, y: 0 }; // Position initiale du joueur
        this.init_model(view);
    }

    createInitialGrid(rows, cols) {
        let grid = [];
        for (let i = 0; i < rows; i++) {
            let row = [];
            for (let j = 0; j < cols; j++) {
                row.push({}); // Remplacer par l'objet cellule approprié
            }
            grid.push(row);
        }
        return grid;
    }

    moveCharacter(direction) {
        // Logique pour déplacer le personnage
        // Mettez à jour this.playerPosition et this.grid en conséquence
        // Ici, vous pouvez implémenter les détails de la logique de déplacement,
        // par exemple vérifier les collisions, les murs, etc.

        // Après le mouvement, renvoyez la nouvelle grille.
        return Promise.resolve(this.grid); // Simule une opération asynchrone
    }

    // Autres méthodes liées à la logique métier comme la gestion des murs, la vérification de victoire, etc.


 init_model(view) {
    var nbLignes = view.nbLignes;
    var nbColonnes = view.nbColonnes;

    for (let i = 0; i < nbLignes - 1; i++) {
        for (let j = 0; j < nbColonnes; j++) {
            horizontal_Walls.addWall(i, j);
            vertical_Walls.addWall(i, j);
        }
    }
    for (let i = 0; i < nbLignes; i++) {
        for (let j = 0; j < nbColonnes; j++) {
            playable_squares.addPlayableSquare(i, j, null, false);
        }
    }
}

 isPlacable(wall) {
    let wallToEdit = null;
    let wallBack = null;
    if(wall.classList.contains("horizontal_hitbox") || wall.classList.contains("vertical_hitbox")){
        wallToEdit = wall.children.item(0);
        console.log("PLACE WALL ON :"+wallToEdit.id);
        let coordinates = wallToEdit.id.split(',');
        if(wall.classList.contains("horizontal_hitbox")){wallBack = horizontal_Walls.getWall(coordinates[0],coordinates[1]);}
        else{wallBack = vertical_Walls.getWall(coordinates[0],coordinates[1]);}
        console.log(wallBack);
        if(!wallBack.isPresent){
            wallBack.setPresent();
            return true;
        }
        return false;
    }
}
}
