// socketServer.js
const socketIo = require('socket.io');
const {GameModel} = require('./logic/Model/Game/GameModel.js');
const {ActionController} = require("./logic/Controller/actionController.js");
const {GameManager} = require("./logic/GameManager.js");

module.exports = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: "http://localhost:63342",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected');

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });

        socket.on('get game model', () => {
            // Créez ou récupérez une instance de GameModel ici
            const gameModel = new GameModel();
            // Sérialisez l'objet gameModel en JSON
            const serializedGameModel = JSON.stringify(gameModel);
            // Envoyez le modèle de jeu au client qui a demandé
            socket.emit('game model', serializedGameModel);
        });

        socket.on('joinGame', () => {
            let responseBoolean = gameController.join()

            socket.emit('placewallResponse',responseBoolean);
        });

        socket.on('placewall', (wallData) => {
            let wallDataDeserialized = JSON.parse(wallData);
            let actionController = new ActionController();
            let responseBoolean = actionController.placeWall(wallDataDeserialized);
            socket.emit('placewallResponse',responseBoolean);
        });

        socket.on('moveCharacter', ()=>{

        });
    });

    return io;
};
