import { GamePresenter } from './Game/GamePresenter.js';
import { GameView } from './Game/GameView.js';
import {GameModel} from "../../back/logic/Model/Game/GameModel.js";
import { AuthService } from './services/AuthService.js';
import { socketManager } from './socket/socketManager.js';

document.addEventListener("DOMContentLoaded", () => {
    const model = new GameModel();
    const view = new GameView(model);
    const presenter = new GamePresenter(model,view);

    AuthService.signUp('testUser', 'testPassword')
        .then(data => {
            console.log('Success:', data);
            localStorage.setItem('token', data.token); // Save the token
            socketManager.initializeSocket(localStorage.getItem('token'));
        })
        .catch(console.error);
});
