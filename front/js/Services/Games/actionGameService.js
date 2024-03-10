// Importer socketManager pour accéder à la socket
import { socketManager } from '../../Socket/socketManager.js';
import {BotActionService} from "./WithBot/BotActionService.js";
import {BotGameService} from "./WithBot/BotGameService.js";
import {config} from "../../Utils/config.js";

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

    getGame(typeGame,callback) {
        switch (typeGame) {
            case config.withBot:
                BotGameService.getGameWithBot(callback);
                break;
            case config.withFriends:
                //this.getGameWithFriends(callback);
                break;
            case config.offline:
                //this.getGameOffline(callback);
                break;
            default:
                console.error('Unknown game type:', typeGame);
        }
    },

    placeWall(typeGame,datas,callback){
        switch (typeGame) {
            case config.withBot:
                BotActionService.placeWallWithBot(datas,callback);
                break;
            case config.withFriends:
                //this.placeWallWithFriends(datas,callback);
                break;
            case config.offline:
                //this.placeWallOffline(datas,callback);
                break;
            default:
                console.error('Unknown game type:', typeGame);
        }
    },

    moveCharacter(typeGame,id, row, col, gameId, token, callback){
        switch (typeGame) {
            case config.withBot:
                BotActionService.moveCharacterWithBot(id, row, col, gameId, token, callback);
                break;
            case config.withFriends:
                //this.moveCharacterWithFriends(id, row, col, gameId, token, callback);
                break;
            case config.offline:
                //this.moveCharacterOffline(id, row, col, gameId, token, callback);
                break;
            default:
                console.error('Unknown game type:', typeGame);
        }
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
