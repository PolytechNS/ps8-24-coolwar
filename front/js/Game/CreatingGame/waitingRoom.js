// Imports des services et managers nécessaires
import { creatingGameService } from '../../Services/Games/CreatingGameService.js';
import { socketManager } from '../../Socket/socketManager.js';
import { friendsService } from "../../Services/Friends/friendsService.js";

// Initialisation à l'ouverture de la fenêtre
window.addEventListener('load', initialize);

// Fonction d'initialisation
function initialize() {
    console.log('Tout est chargé');
    const token = localStorage.getItem('token');

    setupEventListeners(token);
    attemptToJoinWaitingRoom(token);
}

// Configuration des écouteurs d'événements
function setupEventListeners(token) {
    // Écouteur pour le démarrage de la partie
    socketManager.socket.on('startGameWithFriend', handleGameStart);

    // Réponse à la jointure de la salle d'attente
    socketManager.socket.on('join waiting room response', handleJoinWaitingRoomResponse);

    // Bouton "Prêt"
    const readyButton = document.querySelector('.ready');
    readyButton.addEventListener('click', () => emitPlayerReady(token));

    // Bouton "Amis"
    const friendsButton = document.querySelector('.friends');
    if (friendsButton) {
        friendsButton.addEventListener('click', openFriendsListPopup);
    } else {
        console.error('Button "Friends" not found');
    }

    // Bouton de fermeture de la popup des amis
    const closeButton = document.querySelector('.closePopup');
    if (closeButton) {
        closeButton.addEventListener('click', closePopup);
    }
}

// Tentative de rejoindre la salle d'attente
function attemptToJoinWaitingRoom(token) {
    const data = JSON.stringify({ token, gameMode: "waitingForFriends" });
    console.log("Data:", data);
    socketManager.socket.emit('joinGameWithFriends', data);
}

// Gestion du démarrage de la partie
function handleGameStart() {
    console.log('Game is starting...');
    // Redirection si nécessaire
}

// Gestion de la réponse à la jointure de la salle d'attente
function handleJoinWaitingRoomResponse(response) {
    console.log('Join waiting room response:', response);
    updatePlayersList(response.players);
}

// Mise à jour de la liste des joueurs
function updatePlayersList(players) {
    const listPlayersDiv = document.querySelector('.listPlayers');
    listPlayersDiv.innerHTML = ''; // Réinitialiser la liste

    Object.keys(players).forEach(playerId => {
        const player = players[playerId];
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player';
        playerDiv.innerHTML = `
            <div class="leftSide">
                <img class="profilePic" src="../../../../assets/profilePicture.png">
                <p>${player.username}</p>
            </div>
            <div class="isReady">
                <img class="playerReady" src="../../../../assets/playerReady.png" style="display: ${player.ready ? 'block' : 'none'};"/>
                <img class="playerWaiting" src="../../../../assets/playerWaiting.png" style="display: ${!player.ready ? 'block' : 'none'};"/>
            </div>
        `;
        listPlayersDiv.appendChild(playerDiv);
    });
}

// Envoi de l'état "Prêt" au serveur
function emitPlayerReady(token) {
    console.log('Player ready');
    socketManager.socket.emit('ready', JSON.stringify({ token }));


    socketManager.socket.on('readyResponse', (data) => {
        console.log('player ready response');
        console.log(data);
    });
}

// Affichage de la popup des amis
function openFriendsListPopup() {
    console.log('Opening friends list popup');
    const popup = document.getElementById('friendsListPopup');
    popup.style.display = 'block';
    loadFriends(); // Charger la liste des amis si nécessaire
}

// Fermeture de la popup des amis
function closePopup() {
    const popup = document.getElementById('friendsListPopup');
    popup.style.display = 'none';
}

// Chargement et affichage des amis
function loadFriends() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No token found');
        return;
    }

    console.log('Loading friends...');

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
