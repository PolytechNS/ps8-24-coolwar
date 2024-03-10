import {socketManager} from "../../../Socket/socketManager.js ";

export const withFriendsGameService = {
    joinGame: function(token) {
        // Envoyer une requête pour rejoindre une partie avec le token d'identification de l'utilisateur
        const dataToSend = { token: token };
        socketManager.socket.emit('joinGameWithFriends', JSON.stringify(dataToSend));
    },

    waitForOpponent: function(callback) {
        // Attendre la réponse du serveur indiquant qu'un autre utilisateur s'est connecté
        socketManager.socket.on('opponentFound', (gameInfo) => {
            callback(gameInfo);
        });
    }
}
