const {Position} = require("./Position.js");

class GamePlayer {
    constructor(name,position) {
        this.name=name;
        this.position = position;
    }
}

module.exports = { GamePlayer };