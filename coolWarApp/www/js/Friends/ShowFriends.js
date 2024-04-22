import { friendsService } from '../Services/Friends/friendsService.js'; // Assurez-vous que le chemin est correct

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token'); // Récupérer le token stocké
    if (!token) {
        console.error('No token found');
        return; // Ajoutez une gestion d'erreur appropriée ici
    }

    friendsService.listFriends(token)
        .then(friends => {
            const listFriendsDiv = document.querySelector('.listFriends');
            listFriendsDiv.innerHTML = ''; // Nettoyer la liste actuelle
            friends.forEach((friend, index) => {
                const friendDiv = document.createElement('div');
                friendDiv.className = 'friend';
                friendDiv.innerHTML = `
                    <div class="leftSide">
                        <p>${index + 1}.</p>
                        <img class="profilePic" src="../../../assets/profilePicture.png">
                        <p>${friend.username}</p>
                    </div>
                    <div class="rightSide">
                        <p>En ligne il y a 14h...</p> <!-- Adaptez selon vos données -->
                        <img class="levelPic" src="../../../assets/level${friend.level}.png">
                    </div>
                `;
                listFriendsDiv.appendChild(friendDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching friends:', error);
        });
});
