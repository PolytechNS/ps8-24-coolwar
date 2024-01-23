import { config } from '../utils/config.js';

export const AuthService = {
    signUp(username, password) {
        return fetch(`${config.API_ENDPOINT}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        })
            .then(response => response.json());
    },
};
