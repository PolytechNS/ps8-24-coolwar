// login.js
import { AuthService } from '../Services/Login/authService.js'; // Mettez à jour le chemin selon votre structure de projet



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


document.addEventListener('DOMContentLoaded', () => {

    //clean le cache localstorage
    localStorage.clear();

    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = loginForm.querySelector('[name="username"]').value;
        const password = loginForm.querySelector('[name="password"]').value;

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
