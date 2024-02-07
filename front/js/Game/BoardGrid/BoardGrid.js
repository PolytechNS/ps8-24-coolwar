export class BoardGrid{
    constructor() {
        this.plateElement = this.getPlate();
        this.nbLignes = 9;
        this.nbColonnes = 9;
        this.row = 0;
        this.col = 0;
        this.canMove = true;
    }

    //INITIALISE LA GRILLE DE JEU
    createGrid() {
        var plate = this.plateElement;

        window.addEventListener("load", (event) => {
            //définit l'emplacement des éléments Y
            var Y_plate_count = 0;

            for(var lignes=0;lignes<this.nbLignes*2;lignes++) {
                if (lignes === 0 || lignes === this.nbLignes * 2) {
                } else {
                    if (lignes % 2 === 0) {
                        this.buildLineWithFullWall(Y_plate_count, this.nbColonnes);
                        Y_plate_count++;
                    } else {
                        this.buildLineWithPlayableSquare(Y_plate_count, this.nbColonnes);
                    }
                }
            }
            this.openPopUp();
            this.displayElements(this.row, this.col);
            document.addEventListener("keydown", (event) => this.moveCharacter(event));
    })}


    openPopUp(){
        document.getElementById('modal').style.display = 'none'
        document.getElementById('validateTurn').addEventListener('click', function(e) {
            document.getElementById('modal').style.display = 'block'
        });
        document.getElementById('modalClose').addEventListener('click', function(e) {
            document.getElementById('modal').style.display = 'none'
        });
    }

    //affiche le personnage sur une case jouable
    displayElements(row, col) {
        row = Math.max(0, Math.min(row, 8));
        col = Math.max(0, Math.min(col, 8));

        let items = document.getElementsByClassName('playable_square');
        for (let i = 0; i < items.length; i++) {
            items[i].style.backgroundImage = '';
            items[i].style.backgroundSize = 'cover';
        }

        let imgPath = '../../assets/perso1.png'

        items.item(row * 9 + col).style.backgroundImage = `url(${imgPath})`;
    }

    moveCharacter(event) {
        let keyCode = event.keyCode;

        if (this.canMove) {
            let newRow = this.row;
            let newCol = this.col;

            if (keyCode === 37) {
                // Gauche
                newCol = Math.max(0, this.col - 1);
            } else if (keyCode === 39) {
                // Droite
                newCol = Math.min(8, this.col + 1);
            } else if (keyCode === 38) {
                // Haut
                newRow = Math.max(0, this.row - 1);
            } else if (keyCode === 40) {
                // Bas
                newRow = Math.min(8, this.row + 1);
            }

            // Vérifie si le nouveau mouvement restera dans la grille
            if (newRow !== this.row || newCol !== this.col) {
                this.row = newRow;
                this.col = newCol;
                this.displayElements(this.row, this.col);
                this.canMove = false; // Bloque le déplacement après le premier mouvement
            }
        }
    }

    buildLineWithFullWall(Y_plate_count, nbColumns) {
        var finalNbColumns = nbColumns * 2;

        var X_plate_count = 0;

        for (var i = 0; i < finalNbColumns; i++) {
            if (i === 0) {
            } else {
                //intersection
                if (i % 2 === 0) {
                    this.plateElement.appendChild(this.generateIntersectionElement(Y_plate_count, X_plate_count));
                }
                //ligne
                else {
                    this.plateElement.appendChild(this.generateHorizontalWallHTMLElement(Y_plate_count, X_plate_count));
                    X_plate_count++;
                }
            }
        }
    }

    buildLineWithPlayableSquare(nbLines, nbColumns) {
        for (var i = 0; i < nbColumns; i++) {
            this.plateElement.appendChild(this.generatePlayableSquare(nbLines,i));
            if(i!==nbColumns-1){this.plateElement.appendChild(this.generateVerticalWallHTMLElement(nbLines,i));}
        }
    }

    generatePlayableSquare(nbLigne,nbElement){
        var playable_square = this.getEmptyHtmlElement("div");
        playable_square.classList.add("playable_square");
        playable_square.setAttribute("id",nbLigne.toString()+","+nbElement.toString());
        return playable_square;
    }

    generateIntersectionElement(){
        var wall = this.getEmptyHtmlElement("div");
        wall.classList.add("intersection_wall");
        return wall;
    }

    generateVerticalWallHTMLElement(nbLigne,nbElement){
        var container = this.getEmptyHtmlElement("div");
        var wall= this.getEmptyHtmlElement("img");
        wall.classList.add("vertical_wall");
        wall.setAttribute("id",nbLigne.toString()+","+nbElement.toString());
        wall.setAttribute("src","../../datas/vertical_wall_texture.png");
        container.classList.add("vertical_hitbox");
        container.appendChild(wall);
        return container;
    }
    generateHorizontalWallHTMLElement(nbLigne,nbElement){
        var container = this.getEmptyHtmlElement("div");
        var wall= this.getEmptyHtmlElement("img");
        wall.classList.add("horizontal_wall");
        wall.setAttribute("id",nbLigne.toString()+","+nbElement.toString());
        wall.setAttribute("src","../../datas/horizontal_wall_texture.png");
        container.classList.add("horizontal_hitbox");
        container.appendChild(wall);
        return container;
    }

    getPlate(){return document.querySelector('.plate');}
    getEmptyHtmlElement(type){return document.createElement(type);}
}




