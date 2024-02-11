export class Position{
    constructor(row,col) {
        this.row = parseInt(row);
        this.col = parseInt(col);
    }
    toString(){return "row:"+this.row+"/col:"+this.col+"\n";}
}