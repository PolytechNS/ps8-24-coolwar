import { userService } from "../Services/User/userService.js";
import {socketManager} from "../Socket/socketManager.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("DANS NOTIFICATIONS sa mere");
    const token = localStorage.getItem('token');
    listenToNotifications();
    if (token) {
        userService.getNotifications(token).then((response) => {
            console.log("NOTIFICATIONS : ", response);

            if (response.success && response.notifications && response.notifications.length > 0) {
                // Ciblez le bouton à l'intérieur du conteneur 'notificationButton'
                const notificationMenuButton = document.querySelector('.notificationButton button');

                // Ajoutez l'icône de cloche à gauche du texte "Notifications" s'il n'est pas déjà présent
                if (notificationMenuButton && !notificationMenuButton.querySelector('.notification-bell')) {
                    const bellIcon = document.createElement('img');
                    bellIcon.src = '../../../assets/bell-icon.png'; // Ajustez le chemin selon votre structure de fichiers
                    bellIcon.className = 'notification-bell';
                    bellIcon.style.width = '20px';
                    bellIcon.style.height = '20px';

                    // Ajoute l'icône de cloche devant le texte du bouton
                    notificationMenuButton.prepend(bellIcon);
                    notificationMenuButton.querySelector('.notification-bell').classList.add('shake');

                }
            }
        });
    }
});

function listenToNotifications() {
    socketManager.socket.on('receive notification', (notification) => {
        console.log('New notification received SA MERE:', notification);

        const notificationMenuButton = document.querySelector('.notificationButton button');

        // Ajoutez l'icône de cloche à gauche du texte "Notifications" s'il n'est pas déjà présent
        if (notificationMenuButton && !notificationMenuButton.querySelector('.notification-bell')) {
            const bellIcon = document.createElement('img');
            bellIcon.src = '../../../assets/bell-icon.png'; // Ajustez le chemin selon votre structure de fichiers
            bellIcon.className = 'notification-bell';
            bellIcon.style.width = '20px';
            bellIcon.style.height = '20px';

            // Ajoute l'icône de cloche devant le texte du bouton
            notificationMenuButton.prepend(bellIcon);
            notificationMenuButton.querySelector('.notification-bell').classList.add('shake');

        }
    });
}

