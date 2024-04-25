// login.js
import { AuthService } from '../Services/Login/authService.js'; // Mettez à jour le chemin selon votre structure de projet
import { loginAdaptation } from './LoginAdaptation.js';
var myMedia = null;



document.addEventListener('deviceready', OneSignalInit, false);
function OneSignalInit() {
    var mediaUrl = '/android_asset/www/assets/audio/welcome_sound.mp3';
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
    console.log(navigator.vibrate);
    navigator.vibrate(1000);
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

    // Ajouter un écouteur d'événements pour les clics sur un élément spécifique
    // Remplacez 'elementSelector' par le sélecteur CSS de l'élément sur lequel vous souhaitez détecter les clics
    const exploseButtons = document.querySelectorAll(".soundApp");

    // Boucler sur chaque élément et attacher un écouteur d'événements pour les clics
    exploseButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            // Jouer le son lors du clic
            clickSound.play();
        });
    });
});
document.addEventListener('DOMContentLoaded', () => {

    //clean le cache localstorage
    localStorage.clear();

    window.onresize = loginAdaptation;

    const loginButton = document.getElementById('LoginBTN');
    loginButton.addEventListener('click', function(event) {
        event.preventDefault();
        const username = document.querySelector('#usernameLogin').value
        const password = document.querySelector('#passwordLogin').value

        console.log('Login button clicked:', username, password);

        AuthService.login(username, password)
            .then(data => {
                console.log('Login success:', data);
                localStorage.setItem('token', data.token);
                window.location.href = '../MainMenuPage/MainMenuPage.html'; // Redirigez vers la page après connexion
            })
            .catch(error => {
                console.error('Login error:', error);
            });
    });
});



document.addEventListener('deviceready', () => {
    console.log('Device is ready');
    // setTimeout(() => {
    //     lottie.splashscreen
    //         .hide()
    //         .then(_ => console.log('Lottie successfully hid the animation'))
    //         .catch(_ => console.error('Uh oh, there was an error hiding the animation'));
    // }, 1000);
});
