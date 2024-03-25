import { socketManager } from '../../Socket/socketManager.js';
import {config} from "../../Utils/config.js";
import {BotActionService} from "./WithBot/botActionService.js";
import {WithFriendsActionService} from "./WithFriends/withFriendsActionService.js";
import {withFriendsGameService} from "./WithFriends/withFriendsGameService.js";
import {BotGameService} from "./WithBot/botGameService.js";

export const gameService = {
    // ... Autres méthodes ...
    saveGame: function(gameState) {
        // Assurez-vous que la socket est initialisée et connectée
        if (!socketManager.socket || !socketManager.socket.connected) {
            console.error('Socket not initialized or not connected.');
            return;
        }
        console.log("gameState", gameState);
        // Supposons que gameState contient déjà l'ID du jeu 'gameId' et l'état à sauvegarder
        const dataToSave = { gameId: gameState.gameId, userToken: localStorage.getItem('token') };
        //Stringify data to save
        JSON.stringify(dataToSave);
        console.log("dataToSave", dataToSave);
        // Envoyer la demande de sauvegarde au serveur
        socketManager.socket.emit('save game', dataToSave);

        // Écouter la réponse du serveur sur la même socket
        socketManager.socket.once('game saved', (response) => {
            if (response.success) {
                console.log('Game saved successfully');
            } else {
                console.error('Error saving game');
            }
        });
    },

    getWinner(typeGame,gameId,callback){
        if (!socketManager.socket || !socketManager.socket.connected) {
            console.error('Socket not initialized or not connected.');
            return;
        }

        if(typeGame === config.withBot){
            BotGameService.getWinnerWithBot(gameId,callback);
        }
        else if(typeGame === config.withFriends){
            withFriendsGameService.getWinnerWithFriends(gameId,callback);
        }
    },

    getGameWithIdUser(callback) {
        // Assurez-vous que la socket est initialisée et connectée
        if (!socketManager.socket || !socketManager.socket.connected) {
            console.error('Socket not initialized or not connected.');
            return;
        }

        console.log("getGameWithIdUser");
        // Demander le modèle de jeu en utilisant la socket de socketManager
        socketManager.socket.emit('load saved game', { userId: localStorage.getItem('token') });
        console.log("j'ai emit ");
        // Écouter la réponse du serveur sur la même socket
        socketManager.socket.once('loaded game', (gameModel) => {
            console.log("gameModel", gameModel);
            callback(gameModel);
        });
    }
    // ... Autres méthodes ...
};

document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.querySelector('.chatBox');
    const chatBoxToggle = document.querySelector('.chatBoxToggle');

    chatBoxToggle.addEventListener('click', () => {
        chatBox.classList.toggle('closed');
        console.log("click chatbox");
    });
});