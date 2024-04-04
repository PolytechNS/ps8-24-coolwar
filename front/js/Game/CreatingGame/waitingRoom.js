// waitingRoom.js
import { creatingGameService } from '../../Services/Games/CreatingGameService.js';
import { socketManager } from '../../Socket/socketManager.js';

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
});
