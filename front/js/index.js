import { GamePresenter } from './Game/GamePresenter.js';
import { GameView } from './Game/GameView.js';
import { AuthService } from './services/AuthService.js';
import { socketManager } from './socket/socketManager.js';
import { config } from './utils/config.js';

document.addEventListener("DOMContentLoaded", () => {
    const view = new GameView();
    //TODO: PARAMETRER LE MODEL
    const presenter = new GamePresenter(null,view);

    AuthService.signUp('testUser', 'testPassword')
        .then(data => {
            console.log('Success:', data);
            localStorage.setItem('token', data.token); // Save the token
            socketManager.initializeSocket(localStorage.getItem('token'));
        })
        .catch(console.error);
});
