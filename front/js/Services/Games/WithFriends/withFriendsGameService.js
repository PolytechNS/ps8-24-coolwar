import {socketManager} from "../../../Socket/socketManager.js ";
import {config} from "../../../Utils/config.js";
import {BotGameService} from "../WithBot/botGameService.js";

export const withFriendsGameService = {
    joinGame: function(token) {
        // Envoyer une requête pour rejoindre une partie avec le token d'identification de l'utilisateur
        const dataToSend = { token: token };
        socketManager.socket.emit('joinGameWithFriends', JSON.stringify(dataToSend));



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
}

document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.querySelector('.chatBox');
    const chatBoxToggle = document.querySelector('.chatBoxToggle');

    chatBoxToggle.addEventListener('click', () => {
        chatBox.classList.toggle('closed');
        console.log("click chatbox");
    });
});
