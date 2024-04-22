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
                    console.log('Sending game invitation to', friend.username);
                    friendsService.sendGameRequest(friend.username, token)
                        .then(response => {
                            alert(`Invitation sent to ${friend.username}`);

                        })
                        .catch(error => {
                            console.error('Error sending game invitation:', error);
                            alert(`Failed to send invitation to ${friend.username} because: ${error.message}`);

                        });

                });
            });
        })
        .catch(error => {
            console.error('Error fetching friends:', error);
        });


});
