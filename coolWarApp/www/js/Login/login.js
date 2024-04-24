// login.js
import { AuthService } from '../Services/Login/authService.js'; // Mettez à jour le chemin selon votre structure de projet

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
