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
        //AFFICHER LES JOUEURS EN FONCTION DE LEUR POSITION
        let iteration=1;
        model.player_array.players.forEach((player)=>{
            this.displayPlayer(player.position.x,player.position.y,iteration);
            iteration++;
        });
    }


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
    displayPlayer(row, col,id) {
        row = Math.max(0, Math.min(row, 8));
        col = Math.max(0, Math.min(col, 8));
        let items = document.getElementsByClassName('playable_square');
        let imgPath = '../../assets/perso'+id+'.png';
        items.item(row*9+col).style.backgroundSize = 'cover';
        items.item(row * 9 + col).style.backgroundImage = `url(${imgPath})`;
    }

    deletePlayer(row,col,id){
        row = Math.max(0, Math.min(row, 8));
        col = Math.max(0, Math.min(col, 8));
        let items = document.getElementsByClassName('playable_square');
        items.item(row*9+col).style.backgroundSize = 'cover';
        items.item(row * 9 + col).style.backgroundImage = ``;
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
        playable_square.setAttribute("id",nbLigne.toString()+separator+nbElement.toString());
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
        wall.setAttribute("id",nbLigne.toString()+separator+nbElement.toString());
        wall.setAttribute("src","../../datas/vertical_wall_texture.png");
        container.classList.add("vertical_hitbox");
        container.appendChild(wall);
        return container;
    }
    generateHorizontalWallHTMLElement(nbLigne,nbElement){
        var container = this.getEmptyHtmlElement("div");
        var wall= this.getEmptyHtmlElement("img");
        wall.classList.add("horizontal_wall");
        wall.setAttribute("id",nbLigne.toString()+separator+nbElement.toString());
        wall.setAttribute("src","../../datas/horizontal_wall_texture.png");
        container.classList.add("horizontal_hitbox");
        container.appendChild(wall);
        return container;
    }

    getPlate(){return document.querySelector('.plate');}
    getEmptyHtmlElement(type){return document.createElement(type);}
}




