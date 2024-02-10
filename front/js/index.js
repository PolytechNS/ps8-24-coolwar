import { GamePresenter } from './Game/GamePresenter.js';
import {actionGameService} from "./Services/actionGameService.js";
import { GameView } from './Game/GameView.js';
import { AuthService } from './services/AuthService.js';
import { socketManager } from './socket/socketManager.js';

// index.js
document.addEventListener("DOMContentLoaded", () => {
    AuthService.signUp('testUser', 'testPassword').then(data => {
        console.log('Success:', data);
        localStorage.setItem('token', data.token); // Save the token
        socketManager.initializeSocket(localStorage.getItem('token'));

    }).catch(console.error);
});
