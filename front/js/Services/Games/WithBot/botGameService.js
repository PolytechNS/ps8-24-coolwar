import {socketManager} from "../../../Socket/socketManager.js";

export const BotGameService = {

    getGameWithBot(callback) {
        // Assurez-vous que la socket est initialisée et connectée
        if (!socketManager.socket || !socketManager.socket.connected) {
            console.error('Socket not initialized or not connected.');
            return;
        }

        // Demander le modèle de jeu en utilisant la socket de socketManager
        socketManager.socket.emit('getGameWithBot', localStorage.getItem('token'));

        // Écouter la réponse du serveur sur la même socket
        socketManager.socket.once('getGameWithBotResponse', (gameModel) => {
            callback(gameModel);
        });
    },
}