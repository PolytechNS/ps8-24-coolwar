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


// Attacher un gestionnaire d'événements au bouton 'sendChat', si celui-ci existe
const sendChatBtn = document.getElementById('sendChat');
if (sendChatBtn) {
    sendChatBtn.addEventListener('click', () => {
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            const message = chatInput.value;
            console.log('Sending message', message);
            // Ici, je suppose que `model` et `ChatService` sont définis ailleurs et accessibles.
            // Si ce n'est pas le cas, vous devrez également gérer ces dépendances.
            ChatService.sendChatMessage(model.roomId, message);
            chatInput.value = ''; // Effacer le champ de texte après l'envoi
        }
    });
}

// Attacher un gestionnaire d'événements au champ 'chatInput' pour écouter les frappes de touche
const chatInputEl = document.getElementById('chatInput');
if (chatInputEl) {
    chatInputEl.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Empêcher le comportement par défaut
            // Utiliser sendChatBtn si disponible
            if (sendChatBtn) {
                sendChatBtn.click();
            }
        }
    });
}

// Attendre que le DOM soit complètement chargé avant de rechercher et de manipuler les éléments
document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.querySelector('.chatBox');
    const chatBoxToggle = document.querySelector('.chatBoxToggle');

    if (chatBoxToggle) {
        chatBoxToggle.addEventListener('click', () => {
            if (chatBox) {
                chatBox.classList.toggle('closed');
                console.log("click chatbox");
            }
        });
    }
});

