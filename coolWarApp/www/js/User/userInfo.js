import {socketManager} from "../Socket/socketManager.js";
import {userService} from "../Services/User/userService.js";

var myMedia = null;

document.addEventListener('deviceready', OneSignalInit, false);
function OneSignalInit() {

    console.log("OneSignalInit");
    // Remove this method to stop OneSignal Debugging
    window.plugins.OneSignal.Debug.setLogLevel(6);

    // Replace YOUR_ONESIGNAL_APP_ID with your OneSignal App ID
    window.plugins.OneSignal.initialize("bc1f28b3-edce-43eb-88d4-6a9b1fb09860");

    //Adds an event listener for clicks on notifications
    const listener = (event) => {
        const notificationPayload = JSON.stringify(event);
        console.log("OneSignal notification clicked:", notificationPayload);
        console.log(notificationPayload);
        navigator.vibrate(1000);
    };
    window.plugins.OneSignal.Notifications.addEventListener("click", listener);

    //Prompts the user for notification permissions.
    //    * Since this shows a generic native prompt, we recommend instead using an In-App Message to prompt for notification permission (See step 6) to better communicate to your users what notifications they will get.
    window.plugins.OneSignal.Notifications.requestPermission(true).then((accepted) => {
        console.log("User accepted notifications: " + accepted);
    });
}

document.addEventListener('deviceready', () => {
    console.log("Device ready");

    // Définir le chemin vers le fichier sonore
    var mediaUrl = '/android_asset/www/assets/audio/click.wav';

    // Créer l'objet Media une seule fois après que l'appareil est prêt
    var clickSound = new Media(mediaUrl, function onSuccess() {
        // Succès lors de la lecture du son
        console.log("Audio played successfully");
    }, function onError(error) {
        // Erreur lors de la lecture du son
        console.error("Error playing audio: " + error.code + " - " + error.message);
    });

    const exploseButtons = document.querySelectorAll(".soundApp");

    // Boucler sur chaque élément et attacher un écouteur d'événements pour les clics
    exploseButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            // Jouer le son lors du clic
            clickSound.play();
        });
    });
});

function showCssWatch(watch) {
    // Appliquer le style pour cacher tout le contenu existant
    document.body.style.cssText = `
        margin: 0;
        padding: 0;
        width: 352px;
        height: 430px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 40px; // Taille de police pour un petit écran
    `;

    // Supprimer tous les enfants du body
    while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
    }

    // Importer la police et appliquer le style
    var styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
        @import url('https://fonts.googleapis.com/css2?family=Kumar+One&display=swap');
        .watch-content {
            font-family: 'Kumar One', cursive; // Utilisation de la police Kumar One
            color: white; // Couleur du texte
        }
    `;
    document.head.appendChild(styleSheet);

    // Créer et ajouter le contenu spécifique pour le mode montre
    const watchContent = document.createElement("div");
    watchContent.className = "watch-content";
    if(watch){
        watchContent.textContent = "notifications : ";
        injectNotificationStyles();
        listenToNotificationsWatch(watchContent);


    }else{
        watchContent.textContent = "Activez le mode watch dans les settings ";

    }
    document.body.appendChild(watchContent);
}

function listenToNotificationsWatch(watchContent) {
    socketManager.socket.on('receive notification', (notification) => {
        console.log('New notification received:', notification);

        let notificationBell = document.querySelector('.notification-bell');
        if (!notificationBell) {
            notificationBell = document.createElement('img');
            notificationBell.src = '../../../../assets/bell-icon.png'; // Assurez-vous que le chemin d'accès est correct
            notificationBell.className = 'notification-bell';
            notificationBell.style.width = '92px';
            notificationBell.style.height = '92px';

            // Modifier le style de watchContent pour utiliser le flexbox et centrer le contenu
            watchContent.style.display = 'flex';
            watchContent.style.flexDirection = 'column';
            watchContent.style.alignItems = 'center';
            watchContent.style.justifyContent = 'center';
            watchContent.style.height = '100%'; // S'assurer que la div prend toute la hauteur

            // Ajouter la cloche directement au contenu de la montre
            watchContent.appendChild(notificationBell);
        }

        // Ajouter la classe 'shake' pour activer l'animation
        notificationBell.classList.add('shake');
    });
}


document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem('token');
    if (!socketManager.isSocketInitialized(token)) {
        socketManager.initializeSocket(token);
    }

    await userService.getUserInfo(async (userInfo) => {
        if (window.innerWidth <= 400 && window.innerHeight <= 500) {
            showCssWatch(userInfo.watch);
            return;
        }
    });

    updateNotificationRequest();
    listenToNotifications();
    listenToNotificationsMobile()
    if (token) {
        userService.getUserInfo((userInfo) => {
            // Mettre à jour le nom d'utilisateur
            console.log('USER INFO:', userInfo);
            const usernameElement = document.querySelector('.nameAndLogout .username');
            if (usernameElement) {
                usernameElement.textContent = userInfo.username;
            }

            const profilePictureElement = document.querySelector('.user .profilePicture');
            if (profilePictureElement) {
                // Supposons que userInfo.profilePicture contient le chemin d'accès relatif à l'image de profil
                profilePictureElement.src = `../../../../assets/profilePicture/${userInfo.profilePicture}.png`;
            }

            // Mettre à jour le niveau actuel et le niveau suivant
            const currentLevelElement = document.querySelector('.level-progress-info .level-range .current-level');
            const nextLevelElement = document.querySelector('.level-progress-info .level-range .next-level');
            const levelElement = document.querySelector('.level-circle .level-number');

            // Mettre à jour les éléments avec les informations de l'utilisateur
            if (currentLevelElement && nextLevelElement && levelElement) {
                currentLevelElement.textContent = userInfo.lvl; // Niveau actuel
                nextLevelElement.textContent = userInfo.lvl + 1; // Niveau suivant
                levelElement.textContent = userInfo.lvl; // Niveau actuel
            }

            // Mettre à jour l'expérience et la barre de progression
            const currentExpElement = document.querySelector('.level-progress-info .level-points .current-exp');
            const nextLevelExpElement = document.querySelector('.level-progress-info .level-points .next-level-exp');
            const progressBarFill = document.querySelector('.progress-bar .progress-bar-fill');

            const expBase = 100;
            const expFactor = 1.5;
            const nextLvlExp = Math.round(Math.pow(expFactor, userInfo.lvl) * expBase); // Expérience nécessaire pour le prochain niveau, arrondie

            if (currentExpElement && nextLevelExpElement) {
                currentExpElement.textContent = userInfo.exp; // Expérience actuelle
                nextLevelExpElement.textContent = nextLvlExp; // Expérience nécessaire pour le niveau suivant
            }
            if (progressBarFill) {
                // Calcule la largeur de la barre de progression en fonction de l'expérience actuelle
                const expForCurrentLevel = Math.pow(expFactor, userInfo.lvl - 1) * expBase; // Expérience au début du niveau actuel
                const percentage = ((userInfo.exp - expForCurrentLevel) / (nextLvlExp - expForCurrentLevel)) * 100;
                const calculatedWidth = ((userInfo.exp - expForCurrentLevel) / (nextLvlExp - expForCurrentLevel)) * 100;
                progressBarFill.style.width = `${Math.max(calculatedWidth, 1)}%`; // Assure au moins 1% pour visibilité


                console.log(`Current Exp: ${userInfo.exp}, Exp for current level: ${expForCurrentLevel}, Next level Exp: ${nextLvlExp}, Width: ${percentage}%`); // Pour le débogage
            }
        });
    } else {
        console.error("No token found. Please log in.");
    }
});
function updateNotificationRequest() {
    const token = localStorage.getItem('token');
    if (token) {
        userService.getNotifications(token)
            .then((notifications) => {
                console.log('Notifications DANS LE GET:', notifications);

        if(notifications.notifications.length > 0){
            let notificationBell = document.querySelector('.notification-bell');
            if (!notificationBell) {
                const anchorElement = document.createElement('a');
                anchorElement.href = 'NotificationPage/NotificationPage.html';

                notificationBell = document.createElement('img');
                notificationBell.src = '../../../../assets/bell-icon.png';
                notificationBell.className = 'notification-bell';
                notificationBell.style.width = '24px';
                notificationBell.style.height = '24px';
                notificationBell.style.verticalAlign = 'middle';

                anchorElement.appendChild(notificationBell);

                const nameAndLogoutDiv = document.querySelector('.nameAndLogout');
                if (nameAndLogoutDiv) {
                    nameAndLogoutDiv.appendChild(anchorElement);
                }
            }

            // Ajouter la classe 'shake' pour activer l'animation
            notificationBell.classList.add('shake');
        }
        // Vous pouvez ajouter ici d'autres conditions pour différents types de notifications
    });
    }
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

function listenToNotificationsMobile() {

    // Ajouter un écouteur d'événements pour les clics sur la cloche de notification
    document.addEventListener('deviceready', () => {
        console.log("Device ready AND LISTENING TO NOTIFICATIONS MOBILE");
        socketManager.socket.on('receive notification', (notification) => {
            var mediaUrl = '/android_asset/www/assets/audio/notif.wav';
            // Création d'un objet Media, prêt à jouer le son
            myMedia = new Media(mediaUrl,
                function onSuccess() {
                    // Succès lors de la lecture du son
                    console.log("Audio played successfully");
                },
                function onError(error) {
                    // Erreur lors de la lecture du son
                    console.error("Error playing audio: " + error.code + " - " + error.message);
                }
            );
            myMedia.play();
        });
    });
}

function listenToNotifications() {
    socketManager.socket.on('receive notification', (notification) => {
        console.log('New notification received:', notification);
        //vibrate


        let notificationBell = document.querySelector('.notification-bell');
        if (!notificationBell) {
            notificationBell = document.createElement('img');
            notificationBell.src = '../../../../assets/bell-icon.png';
            notificationBell.className = 'notification-bell';
            notificationBell.style.width = '24px';
            notificationBell.style.height = '24px';
            notificationBell.style.verticalAlign = 'middle';

            const nameAndLogoutDiv = document.querySelector('.nameAndLogout');
            if (nameAndLogoutDiv) {
                nameAndLogoutDiv.appendChild(notificationBell);
            }
        }

        // Ajouter la classe 'shake' pour activer l'animation
        notificationBell.classList.add('shake');
    });
}

// Appeler cette fonction pour injecter les styles lorsque le script est exécuté
injectNotificationStyles();
