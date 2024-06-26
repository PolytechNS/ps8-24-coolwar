const separator = "X";
export class BoardGrid{
    constructor(model) {

        this.plateElement = this.getPlate();
        this.nbLignes = model.nbLignes;
        this.nbColonnes = model.nbColonnes;
    }

    //INITIALISE LA GRILLE DE JEU
    createGrid(model) {
        //définit l'emplacement des éléments
        var Y_plate_count = 0;
        for(var lignes=0;lignes<this.nbLignes*2;lignes++) { // car une ligne de case et une ligne de mur
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
        this.updateOpacityWall(model);

        this.openPopUp();
        //AFFICHER LES JOUEURS EN FONCTION DE LEUR POSITION
        let iteration=1;
        model.player_array.forEach((player, iteration) => {
            if(player!=null){this.displayPlayer(player.position.row, player.position.col, iteration + 1);}
        });
    }

    updateOpacityWall(model){
        model.horizontal_Walls.forEach(wall => {
            let wallElement = document.getElementById(wall.position.row + separator + wall.position.col + separator + 'H');
            if (wallElement) {
                wallElement.style.opacity = wall.isPresent ? 1 : 0;
            }
        });
        model.vertical_Walls.forEach(wall => {
            let wallElement = document.getElementById(wall.position.row + separator + wall.position.col + separator + 'V');
            if (wallElement) {
                wallElement.style.opacity = wall.isPresent ? 1 : 0;
            }
        });
    }


    openPopUp(){
        document.getElementById('modal').style.display = 'none'

        //document.getElementById('modalClose').addEventListener('click', function(e) {
        //    document.getElementById('modal').style.display = 'none'
        //});
    }

    //affiche le personnage sur une case jouable
    displayPlayer(row, col,id) {
        row = Math.max(0, Math.min(row, 8));
        col = Math.max(0, Math.min(col, 8));
        let items = document.getElementsByClassName('playable_square');
        let imgPath = '../../assets/perso'+id+'.png';
        items.item(row*9+col).style.backgroundSize = 'cover';
        items.item(row * 9 + col).style.backgroundImage = `url(${imgPath})`;
    }

    updateCharacterPosition(row, col, id){
        //il faudrait find la case qui a le background image /perso2.png et lui enlever le background image
        let items = document.getElementsByClassName('playable_square');
        for(let i=0;i<items.length;i++){
            if(items.item(i).style.backgroundImage.includes('perso'+id+'.png')){
                items.item(i).style.backgroundSize = 'cover';
                items.item(i).style.backgroundImage = ``;
            }
        }
        this.displayPlayer(row,col,id);
    }

    deletePlayer(row,col,id){
        row = Math.max(0, Math.min(row, 8));
        col = Math.max(0, Math.min(col, 8));
        let items = document.getElementsByClassName('playable_square');
        items.item(row*9+col).style.backgroundSize = 'cover';
        items.item(row * 9 + col).style.backgroundImage = ``;
    }


    buildLineWithFullWall(col_plate_count, nbColumns) {
        var finalNbColumns = nbColumns * 2;

        var row_plate_count = 0;

        for (var i = 0; i < finalNbColumns; i++) {
            if (i === 0) {
            } else {
                //intersection
                if (i % 2 === 0) {
                    this.plateElement.appendChild(this.generateIntersectionElement(col_plate_count, row_plate_count));
                }
                //ligne
                else {
                    this.plateElement.appendChild(this.generateHorizontalWallHTMLElement(col_plate_count, row_plate_count));
                    row_plate_count++;
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

    generatePlayableSquare(nbLines,nbElement){
        var playable_square = this.getEmptyHtmlElement("div");
        playable_square.classList.add("playable_square");
        playable_square.setAttribute("id",nbLines.toString()+separator+nbElement.toString());
        return playable_square;
    }

    generateIntersectionElement(){
        var wall = this.getEmptyHtmlElement("div");
        wall.classList.add("intersection_wall");
        return wall;
    }

    generateVerticalWallHTMLElement(nbLines,nbElement){
        var container = this.getEmptyHtmlElement("div");
        var wall= this.getEmptyHtmlElement("img");
        wall.classList.add("vertical_wall");
        wall.setAttribute("id",nbLines.toString()+separator+nbElement.toString()+separator+'V');
        wall.setAttribute("src","../../datas/vertical_wall_texture.png");
        container.classList.add("vertical_hitbox");
        container.appendChild(wall);
        return container;
    }
    generateHorizontalWallHTMLElement(nbLines,nbElement){
        var container = this.getEmptyHtmlElement("div");
        var wall= this.getEmptyHtmlElement("img");
        wall.classList.add("horizontal_wall");
        wall.setAttribute("id",nbLines.toString()+separator+nbElement.toString()+separator+'H');
        wall.setAttribute("src","../../datas/horizontal_wall_texture.png");
        container.classList.add("horizontal_hitbox");
        container.appendChild(wall);
        return container;
    }

    getPlate(){return document.querySelector('.plate');}
    getEmptyHtmlElement(type){return document.createElement(type);}
}




