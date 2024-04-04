import { socketManager } from '../../Socket/socketManager.js';
import {config} from "../../Utils/config.js";
import {BotActionService} from "./WithBot/botActionService.js";
import {WithFriendsActionService} from "./WithFriends/withFriendsActionService.js";
import {withFriendsGameService} from "./WithFriends/withFriendsGameService.js";
import {BotGameService} from "./WithBot/botGameService.js";

const creatingGameService = {
    createGame(token, gameName) {
        return fetch(`${config.API_ENDPOINT}/api/game/createGame`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${token}` // Si vous utilisez un schéma d'autorisation basé sur Bearer tokens
            },
            body: JSON.stringify({ token, gameName }) // Envoie les données nécessaires dans le corps de la requête
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            });
    },

    joinWaitingRoom: function(callback) {
        let token = localStorage.getItem('token');
        const data = JSON.stringify({ token, gameMode : "waitingForFriends" });
        console.log("data", data);
        socketManager.socket.emit('joinGameWithFriends', data);

        socketManager.socket.once('join waiting room response', (response) => {
            callback(response);
        });

    }
};

export { creatingGameService };