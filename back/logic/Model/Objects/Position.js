class Position {
    constructor(row, col) {
        this.row = parseInt(row);
        this.col = parseInt(col);
    }

    toString() {
        return "" + this.row + this.col;
    }
}

module.exports = { Position };
