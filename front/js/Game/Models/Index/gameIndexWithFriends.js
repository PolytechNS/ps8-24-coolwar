// GameIndexWithBot.js
import {GamePresenter} from '../../Controllers/GamePresenter.js';
import {actionGameService} from "../../../Services/Games/actionGameService.js";
import {GameView} from '../../Views/GameView.js';
import {socketManager} from '../../../Socket/socketManager.js';
import {config} from "../../../Utils/config.js";
import {withFriendsGameService} from "../../../Services/Games/WithFriends/withFriendsGameService.js";

import {ChatServiceInGame} from "../../../Services/Chat/chatServiceInGame.js";
import {userService} from "../../../Services/User/userService.js";

let model = null;
let globalPresenter; // Définissez ceci dans une portée accessible là où vous en avez besoin




window.onload = function () {
    console.log('Waiting room');
    const token = localStorage.getItem('token');
    //join
    if(token) {
        if(!socketManager.isSocketInitialized(token)) {
            socketManager.initializeSocket(token);
        }

        initializeListener();

        withFriendsGameService.joinGame(token);

        withFriendsGameService.waitForOpponent((gameInfo) => {
            console.log('Opponent found:', gameInfo);


            const token = localStorage.getItem('token');
            if (token) {
                const gameData = JSON.parse(gameInfo);

                 model = gameData // Assurez-vous que ce modèle est correctement formaté
                console.log("Game initialized with game model");
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

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('token');
    if (token) {
        // Ensure the socket is initialized and attach the listener
        if (!socketManager.isSocketInitialized()) {
            // Initialize the socket and attach the listener in the 'connect' event handler
            socketManager.initializeSocket(token);
            socketManager.socket.on('connect', () => {
                console.log("Socket id:", socketManager.socket.id);
                attachAchievementsListener();
            });
        } else {
            attachAchievementsListener();
        }
        
        userService.getUserInfo((userInfo) => {
            console.log("PROFILE USER info", userInfo);
            if (userInfo.achievements && userInfo.achievements.includes("tu_fais_le_fou.jpg")) {
                insertSoundCloudPlayer();
            }
        });
    } else {
        console.error("No token found. Please log in.");
    }
});

function initializeListener() {
    socketManager.socket.on('updateGameModelWithFriendsResponse', (response) => {
        console.log("RESPONSE UPDATE GAME MODEL WITH FRIENDS");
        console.log(response);
        getGlobalPresenter().updateModel(response);
    });

    socketManager.socket.on('receiveChatMessage', (data) => {
        console.log('Received chat message', data);
        const { sender, message } = JSON.parse(data);

        ChatServiceInGame.appendMessageToChatbox(message, sender, 'chatMessages');
    });
}

function attachAchievementsListener() {
    console.log('Attaching achievements listener');
    socketManager.socket.on('achievementsUnlocked', (data) => {
        const achievementsUnlocked = JSON.parse(data);
        console.log('Achievements unlocked:', achievementsUnlocked);
        displayUnlockedAchievements(achievementsUnlocked);
    });
    displayUnlockedAchievements([{ name: 'First win', description: 'You won your first game!', imagePath: 'first_win.png' }]);
}

function displayUnlockedAchievements(achievements) {
    console.log("JE DISPLAY LES ACHIEVEMENTS");
    achievements.forEach(achievement => {
        // Create the popup container
        const alertContainer = document.createElement('div');
        alertContainer.classList.add('achievement-alert');

        // Create a close button
        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.classList.add('close-button');
        closeButton.onclick = () => document.body.removeChild(alertContainer);

        // Create the image element
        const achievementImage = document.createElement('img');

        achievementImage.src = `../../../../assets/achievements/${achievement.imagePath}`; // Adjust the path as necessary
        achievementImage.alt = achievement.name;
        achievementImage.classList.add('achievement-image');

        // Create the name element
        const achievementName = document.createElement('p');
        achievementName.textContent = achievement.name;
        achievementName.classList.add('achievement-name');

        // Create the description element
        const achievementDescription = document.createElement('p');
        achievementDescription.textContent = achievement.description;
        achievementDescription.classList.add('achievement-description');

        // Create confetti elements
        const confettiCount = 50; // Number of confetti pieces
        const confettiColors = ['red', 'blue', 'green', 'yellow', 'purple']; // Array of possible colors

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)]; // Random color
            confetti.style.left = `${Math.random() * 100}%`; // Random horizontal position
            confetti.style.animationDelay = `${Math.random() * 5}s`; // Random animation delay
            alertContainer.appendChild(confetti); // Append confetti
        }

        // Append elements to the container
        alertContainer.appendChild(closeButton);
        alertContainer.appendChild(achievementImage);
        alertContainer.appendChild(achievementName);
        alertContainer.appendChild(achievementDescription);

        // Append the container to the body
        document.body.appendChild(alertContainer);

        // Set a timeout to automatically remove the alert after 5 seconds
        setTimeout(() => {
            if (document.body.contains(alertContainer)) {
                document.body.removeChild(alertContainer);
            }
        }, 100000); // Adjust time as necessary
    });
}



function insertSoundCloudPlayer() {
    const soundCloudContainer = document.getElementById('soundcloud-container');
    if (true) {
        const playerHtml = `
            <iframe width="90%" height="90%" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1788018703%3Fsecret_token%3Ds-uqqvuwf8xj5&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true" style="margin: 0;"></iframe>
            <div style="font-size: 10px; color: #cccccc;padding-left: 30px; padding-right: 30px;margin:0;">
                <a href="https://soundcloud.com/leomendesmusic" title="leomendesmusic" target="_blank" style="color: #cccccc; text-decoration: none;margin:0;">leomendesmusic</a> · 
                <a href="https://soundcloud.com/leomendesmusic/drip-man-tu-fais-le-fou-vella-ps8/s-uqqvuwf8xj5" title="Drip Man - Tu fais le fou (Vella PS8)" target="_blank" style="color: #cccccc; text-decoration: none;margin:0;">Drip Man - Tu fais le fou (Vella PS8)</a>
            </div>
        `;
        soundCloudContainer.innerHTML = playerHtml;
    }

    const leftColumn = document.querySelector('.left');
    // Vérifiez que leftColumn n'est pas null
    if (leftColumn) {
        const soundCloudContainer = document.createElement('div');
        soundCloudContainer.innerHTML = playerHtml;
        leftColumn.insertBefore(soundCloudContainer, leftColumn.firstChild);
    }
}


// Attacher un gestionnaire d'événements au bouton 'sendChat', si celui-ci existe
const sendChatBtn = document.getElementById('sendChat');
if (sendChatBtn) {
    sendChatBtn.addEventListener('click', () => {
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            const message = chatInput.value;
            console.log('Sending message', message);
            // Ici, je suppose que `model` et `ChatServiceInGame` sont définis ailleurs et accessibles.
            // Si ce n'est pas le cas, vous devrez également gérer ces dépendances.
            ChatServiceInGame.sendChatMessage(model.roomId, message);
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
    const chatBoxWrapper = document.getElementById('chatWrapper');
    const chatBoxToggle = document.querySelector('.chatBoxToggle');
    const chatPlaceholder = document.querySelector('.chatPlaceholder');
    const chatBox = document.querySelector('.chatBox');

    if (chatBoxToggle) {
        chatBoxToggle.addEventListener('click', () => {
            if (chatBox) {
                chatBox.classList.toggle('closed');
                chatPlaceholder.style.display = 'block';
                console.log("click chatbox");
            }
        });
    }

    if (chatPlaceholder) {
        chatPlaceholder.addEventListener('click', () => {
            chatBox.classList.remove('closed');
            chatPlaceholder.style.display = 'none';
        });
    }
});






export function getGlobalPresenter() {
    return globalPresenter;
}

export function getCurrentGameModel() {
    return model;
}

