// login.js
import { AuthService } from '../Services/Login/authService.js'; // Mettez à jour le chemin selon votre structure de projet
import { loginAdaptation } from './LoginAdaptation.js';
document.addEventListener('DOMContentLoaded', () => {

    //clean le cache localstorage
    localStorage.clear();

    window.onresize = loginAdaptation;

    const loginButton = document.getElementById('LoginBTN');
    loginButton.addEventListener('click', function() {
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

