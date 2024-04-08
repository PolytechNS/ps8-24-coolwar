import { userService } from "../Services/User/userService.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("DANS NOTIFICATIONS");
    const token = localStorage.getItem('token');
    setupNotificationButtons(token);
    userService.getNotifications(localStorage.getItem('token')).then((response) => {
        console.log("NOTIFICATIONS : ", response);

        if (response.success) {
            response.notifications.forEach(notification => {
                // Vérifiez le type de notification et sélectionnez le bouton correspondant
                if (notification.type === 'gameRequest') {
                    const gameRequestButton = document.querySelector('.game-request-button');
                    prependBellIcon(gameRequestButton);
                } else if (notification.type === 'friendRequest') {
                    const friendRequestButton = document.querySelector('.friend-request-button');
                    prependBellIcon(friendRequestButton);
                }
                // Vous pouvez ajouter ici d'autres conditions pour différents types de notifications
            });
        }
    });
});
function setupNotificationButtons(token) {
    console.log("SETUP NOTIFICATION BUTTONS");
    const friendRequestButton = document.querySelector('.friend-request-button button');
    if (friendRequestButton) {
        friendRequestButton.addEventListener('click', (e) => {
            console.log("remove notification");
            userService.removeNotification(token, 'friendRequest')
                .then(() => {
                    //window.location.href = 'FriendRequestPage/FriendRequestPage.html'; // Redirige vers la page de demande d'ami
                })
                .catch(error => {
                    console.error('Failed to remove notifications:', error);
                });
        });
    }

    const gameRequestButton = document.querySelector('.game-request-button');
    console.log("gameRequestButton", gameRequestButton);
    if (gameRequestButton) {
        gameRequestButton.addEventListener('click', (e) => {
            e.preventDefault(); // empêcher la navigation par défaut
            console.log("remove notification");
            userService.removeNotification(token, 'gameRequest')
                .then(() => {
                    window.location.href = 'GameRequestPage/GameRequestPage.html'; // Redirige vers la page de demande de jeu
                })
                .catch(error => {
                    console.error('Failed to remove notifications:', error);
                });
        });
    }
}



function prependBellIcon(button) {
    if (!button) return;

    // Vérifiez si l'icône n'a pas déjà été ajoutée
    if (!button.querySelector('.notification-bell')) {
        const bellIcon = document.createElement('img');
        bellIcon.src = '../../../assets/bell-icon.png'; // Mettez à jour le chemin si nécessaire
        bellIcon.className = 'notification-bell';
        bellIcon.style.width = '20px';
        bellIcon.style.height = '20px';
        bellIcon.style.marginRight = '10px';
        button.prepend(bellIcon); // Ajoutez l'icône à l'élément du bouton
    }
    button.querySelector('.notification-bell').classList.add('shake');

    injectNotificationStyles();
}

function injectNotificationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes bell-shake {
            0%, 100% { transform: translateX(0) scale(1); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-10px) scale(1.1); }
            20%, 40%, 60%, 80% { transform: translateX(10px) scale(1.1); }
        }

        .notification-bell.shake {
            animation: bell-shake 2s infinite;
        }
    `;
    document.head.appendChild(style);
}
