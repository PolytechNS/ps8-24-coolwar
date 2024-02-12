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
            try {
                const gameModel = JSON.parse(response);
                callback(gameModel);
            } catch (error) {
                console.error('Error parsing game model:', error);
                // Gérer l'erreur de désérialisation ici
            }
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
    },
    moveCharacter(id,row,col,callback){
        // Assurez-vous que la socket est initialisée et connectée
        if (!socketManager.socket || !socketManager.socket.connected) {
            console.error('Socket not initialized or not connected.');
            return
        }
        let req = {id,row,col};
        let reqSerialized = JSON.stringify(req);
        socketManager.socket.emit('movecharactere',reqSerialized);

        // Écouter la réponse du serveur sur la même socket
        socketManager.socket.once('movecharactereresponse', (res) => {
            callback(res);
        });
    },
    getPlayerPosition(idPlayer,callback){
        // Assurez-vous que la socket est initialisée et connectée
        if (!socketManager.socket || !socketManager.socket.connected) {
            console.error('Socket not initialized or not connected.');
            return
        }

        socketManager.socket.emit('getplayerposition',JSON.stringify(idPlayer));

        // Écouter la réponse du serveur sur la même socket
        socketManager.socket.once('getplayerpositionresponse', (res) => {
            callback(res);
        });
    },
    updateGameInformation(callback){
        // Assurez-vous que la socket est initialisée et connectée
        if (!socketManager.socket || !socketManager.socket.connected) {
            console.error('Socket not initialized or not connected.');
            return
        }
        socketManager.socket.emit('updateGameInformation');

        // Écouter la réponse du serveur sur la même socket
        socketManager.socket.once('updateGameInformationResponse', (res) => {
            callback(res);
        });
    }
};
