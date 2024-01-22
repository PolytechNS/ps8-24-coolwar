import { GamePresenter } from './Game/GamePresenter.js';
import { GameModel } from '../../back/logic/Model/Game/GameModel.js';
import { GameView } from './Game/GameView.js';

document.addEventListener("DOMContentLoaded", () => {
    const model = new GameModel();
    const view = new GameView();
    const presenter = new GamePresenter(model, view);


    const token = localStorage.getItem('token');

    const socket = io('http://localhost:3000', {
        auth: {
            token: token
        }
    });

    socket.on('connect', () => {
        console.log('Connected to the server');
        // Démarrer le jeu ou autre logique ici
        socket.emit('start game', { /* options de jeu */ });
    });

    socket.on('connect_error', (err) => {
        console.log('Connection failed', err.message);
    });



});
