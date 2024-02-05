// signup.js
import { AuthService } from '../Services/AuthService.js'; // Mettez à jour le chemin selon votre structure de projet

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    signupForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = signupForm.querySelector('[name="username"]').value;
        const password = signupForm.querySelector('[name="password"]').value;
        AuthService.signUp(username, password)
            .then(data => {
                console.log('Signup success:', data);
                localStorage.setItem('token', data.token);
                //window.location.href = '/home'; // Redirigez vers la page après inscription
            })
            .catch(error => {
                console.error('Signup error:', error);
            });
    });
});
