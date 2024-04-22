import {socketManager} from "../../Socket/socketManager.js ";


export const ChatServiceFriends = {
    connectToFriendRoom(usernameReceiver, callback) {
        console.log("usernameReceiver",usernameReceiver);
        let token = localStorage.getItem('token');
        console.log("senderToken",token);
        socketManager.socket.emit('join chat friends', JSON.stringify({ token, usernameReceiver }));

        socketManager.socket.on('join chat friends response', (data) => {
            callback(JSON.parse(data));
        });

    },

    sendChatMessage(usernameReceiver, message) {
        let token = localStorage.getItem('token');
        console.log("senderToken",token);
        socketManager.socket.emit('send chat friends request', JSON.stringify({ token, usernameReceiver, message }));


    }
}

