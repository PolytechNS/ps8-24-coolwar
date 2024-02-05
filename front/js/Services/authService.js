// AuthService.js
import { config } from '../utils/config.js'; // Assurez-vous que le chemin est correct

export const AuthService = {
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
};
