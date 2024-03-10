import { withFriendsGameService } from './withFriendsGameService.js';
import {socketManager} from "../../../Socket/socketManager.js"; // Assurez-vous que le chemin est correct

window.onload = function () {
    console.log('Waiting room');
    const token = localStorage.getItem('token');
    //join
    if(token) {
        socketManager.initializeSocket(token);
        withFriendsGameService.joinGame(token);

        withFriendsGameService.waitForOpponent((gameInfo) => {
            console.log('Opponent found:', gameInfo);
            const gameData = encodeURIComponent(JSON.stringify(gameInfo)); // Assurez-vous que gameInfo contient toutes les infos nécessaires
            // Utilisation du lien correct pour la redirection
            localStorage.setItem('gameData', JSON.stringify(gameInfo));
            window.location.href = '../../GamePage/GamePageWithFriends.html';
        });
    } else {
        console.error("No token found, please log in.");
        // Redirigez l'utilisateur vers la page de connexion si nécessaire
    }
}
