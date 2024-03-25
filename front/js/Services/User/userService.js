// Importer socketManager pour accéder à la socket
import { socketManager } from '../../Socket/socketManager.js';

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
    }
}