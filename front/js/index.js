import { GamePresenter } from './Game/GamePresenter.js';
import { GameModel } from '../../back/logic/Model/Game/GameModel.js';
import { GameView } from './Game/GameView.js';

document.addEventListener("DOMContentLoaded", () => {
    const model = new GameModel();
    const view = new GameView();
    const presenter = new GamePresenter(model, view);
    console.log("yo ?");

    // ...rest of your code...

    // Function to sign up a user
    function signUp(username, password) {
        console.log("call signup");
        fetch('http://localhost:3000/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                localStorage.setItem('token', data.token); // Save the token
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

// Call the signUp function with the new parameters
    signUp('testUser', 'testPassword');


    const socket = io('http://localhost:3000', {
        auth: {
            token: localStorage.getItem('token'), // Get the token from local storage
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
