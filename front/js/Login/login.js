// login.js
import { AuthService } from '../Services/AuthService.js'; // Mettez à jour le chemin selon votre structure de projet

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = loginForm.querySelector('[name="username"]').value;
        const password = loginForm.querySelector('[name="password"]').value;

        AuthService.login(username, password)
            .then(data => {
                console.log('Login success:', data);
                localStorage.setItem('token', data.token);
                console.log(data.token);
                //window.location.href = '/home'; // Redirigez vers la page après connexion
            })
            .catch(error => {
                console.error('Login error:', error);
            });
    });
});
