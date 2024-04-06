import {socketManager} from "../../../Socket/socketManager.js";
import {config} from "../../../Utils/config.js";
import {withFriendsGameService} from "../WithFriends/withFriendsGameService.js";

export const BotGameService = {

    getGameWithBot(callback) {
        // Assurez-vous que la socket est initialisée et connectée
        if (!socketManager.socket || !socketManager.socket.connected) {
            console.error('Socket not initialized or not connected.');
            return;
        }

        console.log("GET GAME WITH BOT");

        // Demander le modèle de jeu en utilisant la socket de socketManager
        socketManager.socket.emit('getGameWithBot', localStorage.getItem('token'));

        // Écouter la réponse du serveur sur la même socket
        socketManager.socket.once('getGameWithBotResponse', (gameModel) => {
            callback(gameModel);
        });
    },


    getPlayerPositionWithBot(typeGame, idPlayer,gameId,callback){

        // Assurez-vous que la socket est initialisée et connectée
        if (!socketManager.socket || !socketManager.socket.connected) {
            console.error('Socket not initialized or not connected.');
            return
        }
        let token = localStorage.getItem('token');
        const dataToSend = {idPlayer,gameId, token};
        socketManager.socket.emit('getplayerposition',JSON.stringify(dataToSend));

        // Écouter la réponse du serveur sur la même socket
        socketManager.socket.once('getplayerpositionresponse', (res) => {
            callback(res);
        });
    },
    
    checkWinnerWithBot(gameId,callback){
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

    getWinnerWithBot(gameId,callback){
        // Assurez-vous que la socket est initialisée et connectée
        if (!socketManager.socket || !socketManager.socket.connected) {
            console.error('Socket not initialized or not connected.');
            return
        }
        const dataToParse = {gameId};
        socketManager.socket.emit('getWinnerBot', JSON.stringify(dataToParse));

        // Écouter la réponse du serveur sur la même socket
        socketManager.socket.once('getWinnerBotResponse', (res) => {
            callback(res);
        });
    },


    updateGameModelWithBot: function(informationsData,callback) {
        // Assurez-vous que la socket est initialisée et connectée
        if (!socketManager.socket || !socketManager.socket.connected) {
            console.error('Socket not initialized or not connected.');
            return;
        }
        console.log("UPDATE GAME MODEL WITH BOT");
        // Envoyer la demande de sauvegarde au serveur
        socketManager.socket.emit('updateGameModel', JSON.stringify(informationsData));

        // Écouter la réponse du serveur sur la même socket
        socketManager.socket.once('updateGameModelResponse', (response) => {
            console.log("UPDATE GAME MODEL WITH BOT RESPONSE CALLBACK");
            callback(response);
        });
    },
}