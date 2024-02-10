class Position {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }

    toString() {
        return "row:" + this.row + "/col:" + this.col + "\n";
    }
}

module.exports = { Position };
