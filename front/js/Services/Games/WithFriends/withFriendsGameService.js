import {socketManager} from "../../../Socket/socketManager.js ";
import {config} from "../../../Utils/config.js";
import {BotGameService} from "../WithBot/botGameService.js";

export const withFriendsGameService = {
    joinGame: function(token) {
        // Envoyer une requête pour rejoindre une partie avec le token d'identification de l'utilisateur
        const dataToSend = { token: token };
        socketManager.socket.emit('joinGameWithFriends', JSON.stringify({token: token, gameMode:"playNow"}));
    },

    joinGameRequest: function(token,gameId) {
        // Envoyer une requête pour rejoindre une partie avec le token d'identification de l'utilisateur
        const dataToSend = { token: token, gameId: gameId };
        socketManager.socket.emit('joinGameWithFriends', JSON.stringify({token: token, gameMode:"playNow", gameId:gameId}));
    },

    waitForOpponent: function(callback) {
        socketManager.socket.on('opponentFound', (gameInfo) => {
            //Afficher l'id de la socket
            console.log("id socket moi",socketManager.socket.id);
            callback(gameInfo);
        });
    },

    getPlayerPositionWithFriends(typeGame, idPlayer,gameId,callback){
        socketManager.socket.on("test", (res) => {
            console.log("test PTN",res);
        });
        // Assurez-vous que la socket est initialisée et connectée
        if (!socketManager.socket || !socketManager.socket.connected) {
            console.error('Socket not initialized or not connected.');
            return
        }
        const dataToSend = {idPlayer,gameId};
        socketManager.socket.emit('getplayerpositionWithFriends',JSON.stringify(dataToSend));

        // Écouter la réponse du serveur sur la même socket
        socketManager.socket.once('getplayerpositionresponseWithFriends', (res) => {
            callback(res);
        });
    },

    checkWinnerWithFriends(gameId,callback){
        // Assurez-vous que la socket est initialisée et connectée
        if (!socketManager.socket || !socketManager.socket.connected) {
            console.error('Socket not initialized or not connected.');
            return
        }
        const dataToParse = {gameId};
        console.log("dataToParse", dataToParse);
        socketManager.socket.emit('checkWinnerWithFriends', JSON.stringify(dataToParse));

        // Écouter la réponse du serveur sur la même socket
        socketManager.socket.once('checkWinnerWithFriendsResponse', (res) => {
            callback(res);
        });
    },

    updateGameModelWithFriends: function(informationsData,callback) {
        console.log("UPDATE GAME MODEL WITH FRIENDS");
        // Assurez-vous que la socket est initialisée et connectée
        if (!socketManager.socket || !socketManager.socket.connected) {
            console.error('Socket not initialized or not connected.');
            return;
        }

        // Envoyer la demande de sauvegarde au serveur
        socketManager.socket.emit('updateGameModelWithFriends', JSON.stringify(informationsData));
        // Écouter la réponse du serveur sur la même socket

    },

    getWinnerWithFriends(gameId,callback){
        // Assurez-vous que la socket est initialisée et connectée
        if (!socketManager.socket || !socketManager.socket.connected) {
            console.error('Socket not initialized or not connected.');
            return;
        }
        let data = JSON.stringify({ gameId });
        // Demander le modèle de jeu en utilisant la socket de socketManager
        socketManager.socket.emit('getWinnerWithFriends', data);
        // Écouter la réponse du serveur sur la même socket
        socketManager.socket.once('getWinnerWithFriendsResponse', (winner) => {
            callback(winner);
        });
    }
}


