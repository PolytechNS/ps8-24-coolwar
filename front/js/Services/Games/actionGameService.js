// Importer socketManager pour accéder à la socket
import { socketManager } from '../../Socket/socketManager.js';
import {BotActionService} from "./WithBot/botActionService.js";
import {WithFriendsActionService} from "./WithFriends/withFriendsActionService.js";
import {withFriendsGameService} from "./WithFriends/withFriendsGameService.js";
import {BotGameService} from "./WithBot/botGameService.js";
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

    explodeWall(typeGame,datas,callback){
        switch (typeGame) {
            case config.withFriends:
                WithFriendsActionService.explodeWallWithFriends(datas,callback);
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
                WithFriendsActionService.placeWallWithFriends(datas,callback);
                break;
            case config.offline:
                //this.placeWallOffline(datas,callback);
                break;
            default:
                console.error('Unknown game type:', typeGame);
        }
    },

    moveCharacter(typeGame,id, row, col, gameId, gameBoardId, token, roomId, callback){
        console.log("MOVE CHARACTER");
        console.log("typeGame",typeGame);
        switch (typeGame) {
            case config.withBot:
                BotActionService.moveCharacterWithBot(id, row, col, gameId, gameBoardId, token, callback);
                break;
            case config.withFriends:
                WithFriendsActionService.moveCharacterWithFriends(id, row, col, gameId, token,roomId, callback);
                break;
            case config.offline:
                //this.moveCharacterOffline(id, row, col, gameId, token, callback);
                break;
            default:
                console.error('Unknown game type:', typeGame);
        }
    },

    getPlayerPosition(typeGame, idPlayer,gameId,callback){
        switch (typeGame) {
            case config.withBot:
                BotGameService.getPlayerPositionWithBot(typeGame,idPlayer,gameId,callback);
                break;
            case config.withFriends:
                withFriendsGameService.getPlayerPositionWithFriends(typeGame,idPlayer,gameId,callback);
                break;
        }
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
    checkWinner(typeGame,gameId,callback){
        switch (typeGame) {
            case config.withBot:
                BotGameService.checkWinnerWithBot(gameId,callback);
                break;
            case config.withFriends:
                withFriendsGameService.checkWinnerWithFriends(gameId,callback);
                break;
        }

    },

    updateGameModel: function(informationsData,callback) {
        console.log("UPDATE GAME MODEL");
        console.log(informationsData);
        let typeGame = informationsData[0];
        switch (typeGame) {
            case config.withBot:
                BotGameService.updateGameModelWithBot(informationsData,callback);
                break;
            case config.withFriends:
                withFriendsGameService.updateGameModelWithFriends(informationsData,callback);
                break;
        }
    },
};
