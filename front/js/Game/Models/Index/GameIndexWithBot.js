// GameIndexWithBot.js
import {GamePresenter} from '../../Controllers/GamePresenter.js';
import {actionGameService} from "../../../Services/Games/actionGameService.js";
import {GameView} from '../../Views/GameView.js';
import {socketManager} from '../../../Socket/socketManager.js';
import {config} from "../../../Utils/config.js";

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('token');

    if(!socketManager.isSocketInitialized(token)) {
        socketManager.initializeSocket(token);
    }
    // Assurez-vous que le token est disponible
    if (token) {
        // Vérifiez que la socket est prête avant de lancer le jeu
        const checkSocketReady = setInterval(() => {
            if (socketManager.isSocketInitialized()) {
                clearInterval(checkSocketReady);

                // La socket est prête, initialisons le jeu
                actionGameService.getGame(config.withBot,(serializedGameModel) => {
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


