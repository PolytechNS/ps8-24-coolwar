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
        socketManager.socket.emit('get game model', localStorage.getItem('token'));

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

        let reqSerialized = JSON.stringify(wallList);
        console.log("reqSerialized",reqSerialized);
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
    checkWinner(callback){
        // Assurez-vous que la socket est initialisée et connectée
        if (!socketManager.socket || !socketManager.socket.connected) {
            console.error('Socket not initialized or not connected.');
            return
        }
        socketManager.socket.emit('checkWinner');

        // Écouter la réponse du serveur sur la même socket
        socketManager.socket.once('checkWinnerResponse', (res) => {
            callback(res);
        });
    },

    updateGameModel: function(informationsData) {
        console.log("UPDATE GAME MODEL");
        // Assurez-vous que la socket est initialisée et connectée
        if (!socketManager.socket || !socketManager.socket.connected) {
            console.error('Socket not initialized or not connected.');
            return;
        }
        // Supposons que gameState contient déjà l'ID du jeu 'gameId' et l'état à sauvegarder
        const dataToParse = { gameId: informationsData[1], playerId: informationsData[0] };
        //Stringify data to save
        const dataToSend = JSON.stringify(dataToParse);
        console.log("data Sent : ",dataToSend);

        // Envoyer la demande de sauvegarde au serveur
        socketManager.socket.emit('updateGameModel', dataToSend);

        // Écouter la réponse du serveur sur la même socket
        socketManager.socket.once('updateGameModelResponse', (response) => {
          console.log(response);
        });
    },
};
