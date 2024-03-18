// GameIndexWithBot.js
import {GamePresenter} from '../../Controllers/GamePresenter.js';
import {actionGameService} from "../../../Services/Games/actionGameService.js";
import {GameView} from '../../Views/GameView.js';
import {socketManager} from '../../../Socket/socketManager.js';
import {config} from "../../../Utils/config.js";
import {withFriendsGameService} from "../../../Services/Games/WithFriends/withFriendsGameService.js";

import {ChatService} from "../../../Services/Chat/chatService.js";

let model = null;

document.addEventListener("DOMContentLoaded", () => {
    // Assurez-vous que le token est disponible

});

let globalPresenter; // Définissez ceci dans une portée accessible là où vous en avez besoin

window.onload = function () {
    console.log('Waiting room');
    const token = localStorage.getItem('token');
    //join
    if(token) {
        if(!socketManager.isSocketInitialized(token)) {
            socketManager.initializeSocket(token);
        }
        withFriendsGameService.joinGame(token);

        withFriendsGameService.waitForOpponent((gameInfo) => {
            console.log('Opponent found:', gameInfo);

            const token = localStorage.getItem('token');
            if (token) {
                const gameData = JSON.parse(gameInfo);

                 model = gameData // Assurez-vous que ce modèle est correctement formaté
                console.log("Game initialized with game model");
                console.log(model);
                    const view = new GameView(model);
                const presenter = new GamePresenter(model, view);
                globalPresenter = presenter;
                console.log("Game initialized with game model");

            } else {
                console.error("No token found. Please log in.");
                // Redirigez l'utilisateur vers la page de connexion si nécessaire
            }
        });
    } else {
        console.error("No token found, please log in.");
        // Redirigez l'utilisateur vers la page de connexion si nécessaire
    }
}

export function getGlobalPresenter() {
    return globalPresenter;
}

export function getCurrentGameModel() {
    return model;
}


document.getElementById('sendChat').addEventListener('click', () => {
    const message = document.getElementById('chatInput').value;
    console.log('Sending message', message);
    ChatService.sendChatMessage(model.roomId, message );
    document.getElementById('chatInput').value = ''; // Effacer le champ de texte après l'envoi
});

document.getElementById('chatInput').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Empêcher le comportement par défaut
        document.getElementById('sendChat').click();
    }
});





