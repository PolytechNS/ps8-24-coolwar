// GameIndex.js
import {GamePresenter} from './GamePresenter.js';
import {actionGameService} from "../Services/actionGameService.js";
import {gameService} from "../Services/gameService.js";
import {GameView} from './GameView.js';
import {socketManager} from '../socket/socketManager.js';

document.addEventListener("DOMContentLoaded", () => {
    // Assurez-vous que le token est disponible
    console.log("load");
    const token = localStorage.getItem('token');
    if (token) {
        socketManager.initializeSocket(token);


        // Vérifiez que la socket est prête avant de lancer le jeu
        const checkSocketReady = setInterval(() => {
            if (socketManager.isSocketInitialized()) {
                clearInterval(checkSocketReady);
                // La socket est prête, initialisons le jeu
                gameService.getGameWithIdUser((serializedGameModel) => {

                    // Désérialisez le modèle de jeu JSON en objet JavaScript
                    const model = JSON.parse(serializedGameModel); // Assurez-vous que ce modèle est correctement formaté
                    const view = new GameView(model);
                    const presenter = new GamePresenter(model, view);
                    console.log("Game initialized with game model");
                });
            }
        }, 100); // Vérifiez toutes les 100ms, ajustez selon besoin
    } else {
        console.error("No token found. Please log in.");
        // Redirigez l'utilisateur vers la page de connexion si nécessaire
    }
});


