import { socketManager } from '../socket/socketManager.js';

export const gameService = {
    // ... Autres méthodes ...
    saveGame: function(gameState) {
        // Assurez-vous que la socket est initialisée et connectée
        if (!socketManager.socket || !socketManager.socket.connected) {
            console.error('Socket not initialized or not connected.');
            return;
        }
        // Supposons que gameState contient déjà l'ID du jeu 'gameId' et l'état à sauvegarder
        const dataToSave = { gameId: gameState.idGame };
        //Stringify data to save
        dataToSave.gameState = JSON.stringify(gameState);

        // Envoyer la demande de sauvegarde au serveur
        socketManager.socket.emit('save game', dataToSave);

        // Écouter la réponse du serveur sur la même socket
        socketManager.socket.once('game saved', (response) => {
            if (response.success) {
                console.log('Game saved successfully');
            } else {
                console.error('Error saving game');
            }
        });
    },

    getGameWithIdUser(callback) {
        // Assurez-vous que la socket est initialisée et connectée
        if (!socketManager.socket || !socketManager.socket.connected) {
            console.error('Socket not initialized or not connected.');
            return;
        }

        console.log("getGameWithIdUser");
        // Demander le modèle de jeu en utilisant la socket de socketManager
        socketManager.socket.emit('load saved game', { userId: localStorage.getItem('token') });
        console.log("j'ai emit ");
        // Écouter la réponse du serveur sur la même socket
        socketManager.socket.once('loaded game', (gameModel) => {
            console.log("gameModel", gameModel);
            callback(gameModel);
        });
    }
    // ... Autres méthodes ...
};