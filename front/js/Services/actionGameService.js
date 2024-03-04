// Importer socketManager pour accéder à la socket
import { socketManager } from '../Socket/socketManager.js';

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
        socketManager.socket.emit('get game model', localStorage.getItem('token'));

        // Écouter la réponse du serveur sur la même socket
        socketManager.socket.once('game model', (gameModel) => {
            callback(gameModel);
        });
    },
    placeWall(datas,callback){
        // Assurez-vous que la socket est initialisée et connectée
        if (!socketManager.socket || !socketManager.socket.connected) {
            console.error('Socket not initialized or not connected.');
            return
        }

        let reqSerialized = JSON.stringify(datas);
        socketManager.socket.emit('placewall',reqSerialized);

        // Écouter la réponse du serveur sur la même socket
        socketManager.socket.once('placewallResponse', (res) => {
            callback(res);
        });
    },
    moveCharacter(id,row,col,gameId,token,callback){
        // Assurez-vous que la socket est initialisée et connectée
        if (!socketManager.socket || !socketManager.socket.connected) {
            console.error('Socket not initialized or not connected.');
            return
        }

        let req = {id,row,col,gameId,token};
        let reqSerialized = JSON.stringify(req);
        socketManager.socket.emit('movecharactere',reqSerialized);

        // Écouter la réponse du serveur sur la même socket
        socketManager.socket.once('movecharactereresponse', (res) => {
            callback(res);
        });
    },
    getPlayerPosition(idPlayer,gameId,callback){
        // Assurez-vous que la socket est initialisée et connectée
        if (!socketManager.socket || !socketManager.socket.connected) {
            console.error('Socket not initialized or not connected.');
            return
        }
        const dataToSend = {idPlayer,gameId};
        socketManager.socket.emit('getplayerposition',JSON.stringify(dataToSend));

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
    },
    updateWalls(callback){
        // Assurez-vous que la socket est initialisée et connectée
        if (!socketManager.socket || !socketManager.socket.connected) {
            console.error('Socket not initialized or not connected.');
            return
        }
        socketManager.socket.emit('updateWalls');

        // Écouter la réponse du serveur sur la même socket
        socketManager.socket.once('updateWallsResponse', (res) => {
            callback(res);
        });
    },
    checkWinner(gameId,callback){
        // Assurez-vous que la socket est initialisée et connectée
        if (!socketManager.socket || !socketManager.socket.connected) {
            console.error('Socket not initialized or not connected.');
            return
        }
        const dataToParse = {gameId};
        socketManager.socket.emit('checkWinner', JSON.stringify(dataToParse));

        // Écouter la réponse du serveur sur la même socket
        socketManager.socket.once('checkWinnerResponse', (res) => {
            callback(res);
        });
    },

    updateGameModel: function(informationsData,callback) {
        console.log("UPDATE GAME MODEL");
        console.log(informationsData);
        // Assurez-vous que la socket est initialisée et connectée
        if (!socketManager.socket || !socketManager.socket.connected) {
            console.error('Socket not initialized or not connected.');
            return;
        }

        // Envoyer la demande de sauvegarde au serveur
        socketManager.socket.emit('updateGameModel', JSON.stringify(informationsData));

        // Écouter la réponse du serveur sur la même socket
        socketManager.socket.once('updateGameModelResponse', (response) => {
            callback(response);
        });
    },
};
