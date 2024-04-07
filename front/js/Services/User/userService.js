// Importer socketManager pour accéder à la socket
import { socketManager } from '../../Socket/socketManager.js';
import {config} from "../../Utils/config.js";

export const userService = {

    getUserInfo(callback){
        // Demander le modèle de jeu en utilisant la socket de socketManager
        console.log("le token" ,localStorage.getItem('token'));
        socketManager.socket.emit('get info user', JSON.stringify(localStorage.getItem('token')));

        // Écouter la réponse du serveur sur la même socket
        socketManager.socket.once('get info user response', (response) => {
            try {
                const userInfo = JSON.parse(response);
                callback(userInfo);
            } catch (error) {
                console.error('Error parsing user info:', error);
                // Gérer l'erreur de désérialisation ici
            }
        });
    },

    getAllAchievements(callback){
        // Demander le modèle de jeu en utilisant la socket de socketManager
        socketManager.socket.emit('get all achievements', JSON.stringify(localStorage.getItem('token')));

        // Écouter la réponse du serveur sur la même socket
        socketManager.socket.once('get all achievements response', (response) => {
            try {
                const achievements = JSON.parse(response);
                callback(achievements);
            } catch (error) {
                console.error('Error parsing achievements:', error);
                // Gérer l'erreur de désérialisation ici
            }
        });
    },

    listUsersLeaderboard(token) {
        return fetch(`${config.API_ENDPOINT}/api/users/leaderboard`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },

        }).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        });
    },

    getUserSkin(token) {
        return fetch(`${config.API_ENDPOINT}/api/users/skins`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        }).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        });
    }


}