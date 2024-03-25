import {socketManager} from "../../../Socket/socketManager.js ";
import {config} from "../../../Utils/config.js";
import {BotGameService} from "./botGameService.js";
import {WithFriendsActionService} from "../WithFriends/withFriendsActionService.js";


export const BotActionService = {


    placeWallWithBot(datas, callback){
        // Assurez-vous que la socket est initialisée et connectée
        if (!socketManager.socket || !socketManager.socket.connected) {
            console.error('Socket not initialized or not connected.');
            return
        }

        let reqSerialized = JSON.stringify(datas);
        socketManager.socket.emit('placeWallWithBot',reqSerialized);

        // Écouter la réponse du serveur sur la même socket
        socketManager.socket.once('placeWallWithBotResponse', (res) => {
            callback(res);
        });
    },
    moveCharacterWithBot(id, row, col, gameId, token, callback){

        console.log("moveCharacterWithBot");
        // Assurez-vous que la socket est initialisée et connectée
        if (!socketManager.socket || !socketManager.socket.connected) {
            console.error('Socket not initialized or not connected.');
            return
        }


        let req = {id,row,col,gameId,token};
        let reqSerialized = JSON.stringify(req);
        console.log("ça move", req);
        socketManager.socket.emit('moveCharacterWithBot',reqSerialized);

        // Écouter la réponse du serveur sur la même socket
        socketManager.socket.once('moveCharacterWithBotResponse', (res) => {
            callback(res);
        });
    },



}