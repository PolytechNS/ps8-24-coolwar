// AuthService.js
import { config } from '../../Utils/config.js'; // Assurez-vous que le chemin est correct

const AuthService = {
    login(username, password) {
        return fetch(`${config.API_ENDPOINT}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        })
            .then(response => response.json());
    },
    signUp(username, password) {
        return fetch(`${config.API_ENDPOINT}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        })
            .then(response => response.json());
    },

    getLoginPage() {
        return fetch(`${config.API_ENDPOINT}/api/auth/login`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/html' },
        })
            .then(html => document.body.innerHTML = html);
    }
};

export { AuthService };

