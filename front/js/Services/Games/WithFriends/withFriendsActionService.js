import {socketManager} from "../../../Socket/socketManager.js ";


export const WithFriendsActionService = {


    placeWallWithFriends(datas, callback){
        console.log("DANS PLACING WALL WITH FRIENDS")
        // Assurez-vous que la socket est initialisée et connectée
        if (!socketManager.socket || !socketManager.socket.connected) {
            console.error('Socket not initialized or not connected.');
            return
        }

        let reqSerialized = JSON.stringify(datas);
        socketManager.socket.emit('placeWallWithFriends',reqSerialized);

        // Écouter la réponse du serveur sur la même socket
        socketManager.socket.once('placeWallWithFriendsResponse', (res) => {
            callback(res);
        });
    },
    moveCharacterWithFriends(id, row, col, gameId, token,roomId, callback){
        console.log("DANS MOVE CHARACTER WITH FRIENDS")

        // Assurez-vous que la socket est initialisée et connectée
        if (!socketManager.socket || !socketManager.socket.connected) {
            console.error('Socket not initialized or not connected.');
            return
        }

        let req = {id,row,col,gameId,token,roomId};
        let reqSerialized = JSON.stringify(req);
        socketManager.socket.emit('moveCharacterWithFriends',reqSerialized);

        // Écouter la réponse du serveur sur la même socket
        socketManager.socket.once('moveCharacterWithFriendsResponse', (res) => {
            callback(res);
        });
    }
}