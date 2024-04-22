// SeeGameRequest.js
import { gameService } from '../Services/Games/gameService.js';
import {friendsService} from "../Services/Friends/friendsService.js";


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
                            <p>${request.invitedUsername}</p>
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
                        <button class="decline explose" data-game-id="${request.gameId}">Decline</button>
                        <button class="join explose" data-inviting-user-name="${request.invitingUsername}">Join</button>
                    </div>
                `;
                listGameRequestDiv.appendChild(gameRequestDiv);

                // Ajout des écouteurs d'événement pour les boutons Decline et Join
                gameRequestDiv.querySelector('.decline').addEventListener('click', function() { declineGameRequest(this.getAttribute('data-inviting-user-name'), token); });
                gameRequestDiv.querySelector('.join').addEventListener('click', function() { joinGameRequest(this.getAttribute('data-inviting-user-name'), token); });
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

function joinGameRequest(invitingUserName, token) {

    console.log('Joining game request');
    console.log(`Joining game ${invitingUserName}`);
    friendsService.acceptGameRequest(invitingUserName, token)
        .then(response => {
            console.log('Game request response:', invitingUserName);
            if(response.message === "Game invitation accepted"){
                window.location.href = '../../../../PlayPage/CreateGamePage/GameReadyPage/GameReadyPage.html';

            }

        })
        .catch(error => {
            console.error('Error joining game:', error);
        });
}
