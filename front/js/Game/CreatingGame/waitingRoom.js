// waitingRoom.js
import { creatingGameService } from '../../Services/Games/CreatingGameService.js';
import { socketManager } from '../../Socket/socketManager.js';
import {friendsService} from "../../Services/Friends/friendsService.js";

// Supposons que `socketManager` a déjà initialisé une connexion socket.
// Si ce n'est pas le cas, vous devrez initialiser la connexion ici.

window.addEventListener('load', () => {
    console.log('Tout est chargé');

    // Récupérer le token et gameId stockés, peut-être lors de la création du jeu.
    const token = localStorage.getItem('token');

    const readyButton = document.querySelector('.ready');

    readyButton.addEventListener('click', () => {
        console.log('Player ready');

        // Envoie de l'état "ready" au serveur via Socket.IO
        socketManager.socket.emit('ready', JSON.stringify({ token }));

    });

    // Écouter pour le démarrage de la partie
    socketManager.socket.on('startGameWithFriend', () => {
        console.log('Game is starting...');
        //window.location.href = `/path/to/game/page?gameId=${gameId}`; // Ajustez le chemin selon votre application
    });

    // Join the waiting room upon loading
    creatingGameService.joinWaitingRoom((response) => {
        console.log('Join waiting room response:', response);
    });

    const friendsButton = document.querySelector('.friends');
    if (friendsButton) {
        console.log('Friends button found');
        friendsButton.addEventListener('click', () => {
            openFriendsListPopup();
        });
    } else {
        console.error('Button "Friends" not found');
    }
});


function openFriendsListPopup() {
    console.log('Opening friends list popup');
    const popup = document.getElementById('friendsListPopup');
    popup.style.display = 'block'; // Montrer la pop-up

    // Vérifier si la liste a déjà été chargée
    const listFriendsDiv = document.querySelector('.listFriends');
    console.log('Loading friends...');
    loadFriends(); // Charger les amis si la liste est vide
}

function closePopup() {
    const popup = document.getElementById('friendsListPopup');
    popup.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    const closeButton = document.querySelector('.closePopup');
    if (closeButton) {
        closeButton.addEventListener('click', closePopup);
    }
});

// Fonction pour charger et afficher les amis
function loadFriends() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No token found');
        return;
    }

    friendsService.listFriends(token)
        .then(friends => {
            const listFriendsDiv = document.querySelector('.listFriends');
            listFriendsDiv.innerHTML = '';
            friends.forEach((friend, index) => {
                const friendDiv = document.createElement('div');
                friendDiv.className = 'friend';
                friendDiv.innerHTML = `
                    <div class="friendContent">
                        <div class="leftSide">
                            <p>${index + 1}.</p>
                            <img class="profilePic" src="../../../assets/profilePicture.png">
                            <p>${friend.username}</p>
                        </div>
                        <div class="rightSide">
                            <p>En ligne il y a 14h...</p>
                            <img class="levelPic" src="../../../assets/level${friend.level}.png">
                        </div>
                    </div>
                `;
                listFriendsDiv.appendChild(friendDiv);

                // Ajout de l'écouteur d'événement sur toute la div 'friend'
                friendDiv.addEventListener('click', () => {
                    console.log('Sending game invitation to', friend.username);
                    friendsService.sendGameRequest(friend.username, token)
                        .then(response => {
                            console.log('Game invitation response:', response);
                            alert(`Invitation sent to ${friend.username}`);
                        })
                        .catch(error => {
                            console.error('Error sending game invitation:', error);
                            alert(`Failed to send invitation to ${friend.username} because: ${error.message}`);

                        });
                });
            });
        })
        .catch(error => {
            console.error('Error fetching friends:', error);
        });
}

// Gestionnaire d'événement pour ouvrir la pop-up quand on clique sur "Amis"


