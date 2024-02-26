import {AuthService} from './Services/authService.js';

document.getElementById('login-button').addEventListener('click', () => AuthService.getLoginPage());


document.addEventListener('DOMContentLoaded', function() {
    const signinButton = document.getElementById('login-button');
    signinButton.addEventListener('click', function(event) {
        window.location.href = './js/Login/login.html'; // Redirigez vers la page dinscription
        console.log('Login button clicked');
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const signinButton = document.getElementById('signinButton');
    signinButton.addEventListener('click', function(event) {
        window.location.href = './js/Login/signup.html'; // Redirigez vers la page dinscription
        console.log('Signin button clicked');
    });
});
