// GameIndexWithBot.js
import {GamePresenter} from '../../Controllers/GamePresenter.js';
import {actionGameService} from "../../../Services/Games/actionGameService.js";
import {GameView} from '../../Views/GameView.js';
import {socketManager} from '../../../Socket/socketManager.js';
import {config} from "../../../Utils/config.js";

document.addEventListener("DOMContentLoaded", () => {
    // Assurez-vous que le token est disponible
    const token = localStorage.getItem('token');
    if (token) {
        socketManager.initializeSocket(token);
        const gameData = JSON.parse(localStorage.getItem('gameData'));
        localStorage.removeItem('gameData');

        const model = JSON.parse(gameData); // Assurez-vous que ce modèle est correctement formaté
        console.log("Game initialized with game model");
        console.log(model);
        const view = new GameView(model);
        const presenter = new GamePresenter(model, view);
        console.log("Game initialized with game model");

    } else {
        console.error("No token found. Please log in.");
        // Redirigez l'utilisateur vers la page de connexion si nécessaire
    }
});


