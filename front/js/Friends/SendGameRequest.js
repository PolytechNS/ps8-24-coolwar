// InviteFriendPageScript.js
import { friendsService } from '../Services/Friends/friendsService.js'; // Assurez-vous que le chemin est correct
import { gameService } from '../Services/Games/gameService.js'; // Ajoutez le chemin correct vers votre service de gestion de jeu

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const gameId = localStorage.getItem('gameId');

    if (!token) {
        console.error('No token found');
        return;
    }

    friendsService.listFriends(token)
        .then(friends => {
            const listFriendsDiv = document.querySelector('.listFriends');
            listFriendsDiv.innerHTML = '';
            friends.forEach((friend, index) => {
                const friendDiv = document.createElement('div');
                friendDiv.className = 'friend';
                friendDiv.innerHTML = `
                    <div class="friendContent">
                        <div class="leftSide">
                            <p>${index + 1}.</p>
                            <img class="profilePic" src="../../../assets/profilePicture.png">
                            <p>${friend.username}</p>
                        </div>
                        <div class="rightSide">
                            <p>En ligne il y a 14h...</p>
                            <img class="levelPic" src="../../../assets/level${friend.level}.png">
                        </div>
                    </div>
                `;
                listFriendsDiv.appendChild(friendDiv);

                // Ajout de l'écouteur d'événement sur toute la div 'friend'
                friendDiv.addEventListener('click', () => {
                    friendsService.sendGameRequest(gameId, friend.username, token)
                        .then(response => {
                            console.log('Game invitation response:', response);
                            if (response.success) {
                                const notif = document.querySelector('.notif');
                                const notifSpan = document.createElement('span');
                                notifSpan.className='notifcation';
                                notif.appendChild(notifSpan);
                                alert(`Invitation sent to ${friend.username}`);
                            } else {
                                alert(`Failed to send invitation to ${friend.username}`);
                            }
                        })
                        .catch(error => {
                            console.error('Error sending game invitation:', error);
                        });
                });
            });
        })
        .catch(error => {
            console.error('Error fetching friends:', error);
        });
});
