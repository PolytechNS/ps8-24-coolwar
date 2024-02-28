// signup.js
import { AuthService } from '../Services/authService.js'; // Mettez à jour le chemin selon votre structure de projet

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    signupForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = signupForm.querySelector('[name="username"]').value;
        const password = signupForm.querySelector('[name="password"]').value;
        console.log('username:', username);
        console.log('password:', password)
        AuthService.signUp(username, password)
            .then(data => {
                console.log('Signup success:', data);
                localStorage.setItem('token', data.token);
                console.log(data.token);
                window.location.href = '../Login/login.html'; // Redirigez apres inscription
            })
            .catch(error => {
                console.error('Signup error:', error);
            });
    });
});
