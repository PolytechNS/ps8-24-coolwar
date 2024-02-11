// Importer socketManager pour accéder à la socket
import { socketManager } from '../socket/socketManager.js';

export const actionGameService = {

    joinGame(callback){
        // Assurez-vous que la socket est initialisée et connectée
        if (!socketManager.socket || !socketManager.socket.connected) {
            console.error('Socket not initialized or not connected.');
            return;
        }

        // Demander le modèle de jeu en utilisant la socket de socketManager
        socketManager.socket.emit('joinGame');

        // Écouter la réponse du serveur sur la même socket
        socketManager.socket.once('joinGamResponse', (response) => {
            callback(response);
        });

    },
    getGame(callback) {
        // Assurez-vous que la socket est initialisée et connectée
        if (!socketManager.socket || !socketManager.socket.connected) {
            console.error('Socket not initialized or not connected.');
            return;
        }

        // Demander le modèle de jeu en utilisant la socket de socketManager
        socketManager.socket.emit('get game model');

        // Écouter la réponse du serveur sur la même socket
        socketManager.socket.once('game model', (gameModel) => {
            callback(gameModel);
        });
    },

    placeWall(wallList,callback){
        // Assurez-vous que la socket est initialisée et connectée
        if (!socketManager.socket || !socketManager.socket.connected) {
            console.error('Socket not initialized or not connected.');
            return
        }

        let req = {wallList};
        let reqSerialized = JSON.stringify(req);
        socketManager.socket.emit('placewall',reqSerialized);

        // Écouter la réponse du serveur sur la même socket
        socketManager.socket.once('placewallResponse', (res) => {
            callback(res);
        });
    }
};
