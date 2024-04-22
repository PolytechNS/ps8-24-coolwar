// createGamePage.js
import { creatingGameService } from '../../Services/Games/CreatingGameService.js';

window.addEventListener('load', () => {
    const createButton = document.querySelector('.createGame');
    const gameNameInput = document.getElementById('gameName');

    createButton.addEventListener('click', (event) => {
        event.preventDefault(); // sert à empêcher le formulaire d'être soumis
        const gameName = gameNameInput.value;
        const token = localStorage.getItem("token"); // Récupérez le token de l'utilisateur de la manière appropriée
        console.log("token", token);
        console.log("gameName", gameName);
        if (gameName) {

            creatingGameService.createGame(token, gameName)
                .then(data => {
                    console.log("create game data", data);
                    if (data.message === 'Game created successfully') {
                        window.location.href = './GameReadyPage/GameReadyPage.html';
                    } else {
                        console.error('Failed to create game:', data.message);
                    }
                })
                .catch(error => {
                    console.error('Error creating game:', error);
                });


        } else {
            alert('Please enter a game name.');
        }
    });
});
