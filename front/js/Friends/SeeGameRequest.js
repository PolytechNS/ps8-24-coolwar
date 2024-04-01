// SeeGameRequest.js
import { gameService } from '../Services/Games/gameService.js';
import {friendsService} from "../Services/Friends/friendsService.js"; // Assurez-vous que le chemin est correct

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');

    if (!token) {
        console.error('No token found');
        return;
    }

    friendsService.getGameRequests(token)
        .then(gameRequests => {
            const listGameRequestDiv = document.querySelector('.listGameRequest');
            listGameRequestDiv.innerHTML = ''; // Nettoyer la liste actuelle
            gameRequests.forEach((request, index) => {
                const gameRequestDiv = document.createElement('div');
                gameRequestDiv.className = 'gameRequest';
                gameRequestDiv.innerHTML = `
                    <div class="banner" data-game-id="${request.gameId}">
                        <div class="leftSide">
                            <p>${index + 1}.</p>
                            <p>${request.gameName}</p>
                        </div>
                        <div class="middleSide">
                            <p>VS</p>
                            <img class="profilePic" src="../../../../assets/profilePicture.png">
                            <p>${request.invitingUsername}</p>
                        </div>
                        <div class="rightSide">
                            <p>Time</p>
                            <p>Date</p>
                        </div>
                    </div>
                    <div class="footer">
                        <button class="decline" data-game-id="${request.gameId}">Decline</button>
                        <button class="join" data-game-id="${request.gameId}">Join</button>
                    </div>
                `;
                listGameRequestDiv.appendChild(gameRequestDiv);

                // Ajout des écouteurs d'événement pour les boutons Decline et Join
                gameRequestDiv.querySelector('.decline').addEventListener('click', function() { declineGameRequest(this.getAttribute('data-game-id'), token); });
                gameRequestDiv.querySelector('.join').addEventListener('click', function() { joinGameRequest(this.getAttribute('data-game-id'), token); });
            });
        })
        .catch(error => {
            console.error('Error fetching game requests:', error);
        });
});


function declineGameRequest(gameId, token) {
    // Implémentez la logique pour refuser l'invitation de jeu
    console.log(`Declining game request for game ${gameId}`);
    // Vous aurez besoin d'appeler une API ou une fonction de service pour refuser l'invitation
}

function joinGameRequest(gameId, token) {
    //clear local storage
    localStorage.removeItem('gameId');
    console.log(`Joining game ${gameId}`);
    friendsService.acceptGameRequest(gameId, token)
        .then(response => {
            console.log('Game request response:', response);
            if(response.message === "Game invitation accepted"){
                localStorage.setItem('gameId', gameId);
                window.location.href = '../../../../PlayPage/CreateGamePage/GameReadyPage/GameReadyPage.html';

            }

        })
        .catch(error => {
            console.error('Error joining game:', error);
        });
}
