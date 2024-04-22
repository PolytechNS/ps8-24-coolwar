import { friendsService } from '../Services/Friends/friendsService.js'; // Assurez-vous que le chemin est correct

// Cette fonction attache des écouteurs d'événements aux boutons Accepter et Rejeter.
function attachEventListeners(token) {
    document.querySelectorAll('.accept').forEach(button => {
        button.addEventListener('click', function() {
            const username = this.getAttribute('data-username');
            friendsService.acceptFriendRequest(token, username).then(response => {
                console.log(response); // Traitez la réponse ici
                this.parentElement.parentElement.remove(); // Supprime la demande d'ami du DOM
            }).catch(error => {
                console.error('Error accepting friend request:', error);
            });
        });
    });

    document.querySelectorAll('.reject').forEach(button => {
        button.addEventListener('click', function() {
            const username = this.getAttribute('data-username');
            friendsService.rejectFriendRequest(token, username).then(response => {
                console.log(response); // Traitez la réponse ici
                this.parentElement.parentElement.remove(); // Supprime la demande d'ami du DOM
            }).catch(error => {
                console.error('Error rejecting friend request:', error);
            });
        });
    });
}

// Cette fonction est appelée lorsque la page est chargée pour lister toutes les demandes d'amis.
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token'); // Récupérer le token stocké
    if (!token) {
        console.error('No token found');
        return; // Ajoutez une gestion d'erreur appropriée ici
    }

    friendsService.listFriendRequests(token)
        .then(requests => {
            const listFriendRequestDiv = document.querySelector('.listFriendRequest');
            listFriendRequestDiv.innerHTML = ''; // Nettoyer la liste actuelle

            requests.forEach((request, index) => {
                const requestDiv = document.createElement('div');
                requestDiv.className = 'friendRequest';
                requestDiv.innerHTML = `
                    <div class="banner">
                        <div class="leftSide">
                            <p>${index + 1}.</p>
                            <img class="profilePic" src="../../../../assets/profilePicture.png"> <!-- Remplacez par la photo de profil de l'utilisateur si disponible -->
                            <p>${request.username}</p> <!-- Nom de l'utilisateur qui a envoyé la demande -->
                        </div>
                        <div class="rightSide">
                            <p>En ligne il y a 14h...</p> <!-- Supposons que vous avez cette information -->
                            <img class="levelPic" src="../../../../assets/level99.png"> <!-- Remplacez par le niveau de l'utilisateur si disponible -->
                        </div>
                    </div>
                    <div class="footer">
                        <button class="reject" data-username="${request.username}">Reject</button>
                        <button class="accept" data-username="${request.username}">Accept</button>
                    </div>
                `;
                listFriendRequestDiv.appendChild(requestDiv);
            });

            // Attache les écouteurs d'événements après que tous les boutons soient créés et ajoutés au DOM.
            attachEventListeners(token);
        })
        .catch(error => {
            console.error('Error fetching friend requests:', error);
        });
});
