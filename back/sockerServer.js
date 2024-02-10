// socketServer.js
const socketIo = require('socket.io');
const GameModel = require('./logic/Model/Game/GameModel.js');

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
            // Envoyez le modèle de jeu au client qui a demandé
            socket.emit('game model', gameModel);
        });

        // Additional socket event handlers...
    });

    return io;
};
