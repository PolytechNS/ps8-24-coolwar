// socketServer.js
const socketIo = require('socket.io');
const {storeMessages,
    getMessages
} = require('../Controller/userController.js');
const { MongoClient,ObjectId } = require('mongodb');
const {MONGO_URL} = require("../Utils/constants");
const client = new MongoClient(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });


//room pour les chats
const chatRoom = new Map();

function createRoomKey(id1, id2) {
    return [id1, id2].sort().join('_');
}

module.exports = (io, socket) => {
    socket.on('join chat friends', async (data) => {
        let dataParse = JSON.parse(data);
        let send = dataParse.token;
        let receive = dataParse.usernameReceiver;
        console.log("receive data",data);
        console.log("data parse",dataParse);
        await client.connect();
        const db = client.db();
        const userSend = await db.collection('users').findOne({ token: send });
        const userReceive = await db.collection('users').findOne({ username: receive });
        console.log('userSend',userSend);
        console.log('userReceive',userReceive);
        const roomKey = createRoomKey(userReceive._id.toString(), userSend._id.toString());
        let room = chatRoom.get(roomKey);

        if (!room) {
            room = { user1: userReceive._id, user2: userSend._id};
            chatRoom.set(roomKey, room);
            socket.join(roomKey);
            let message = await getMessages(userSend._id, userReceive._id);
            console.log('room created');
            const dataToSend = {message: message, roomKey: roomKey};
            io.to(roomKey).emit('join chat friends response',JSON.stringify(dataToSend));
        }else{
            socket.join(roomKey);
            let message = await getMessages(userSend._id, userReceive._id);
            const dataToSend = {message: message, roomKey: roomKey,test:"test eheh"};
            io.to(roomKey).emit('join chat friends response',JSON.stringify(dataToSend));
        }
    });

    socket.on('send chat friends request', async (data) => {
        let dataParse = JSON.parse(data);
        let send = dataParse.token;
        let receive = dataParse.usernameReceiver;
        let message = dataParse.message;
        console.log("receive data FROM SENDING CHAT",data);
        console.log("data parse",dataParse);
        await client.connect();
        const db = client.db();
        const userSend = await db.collection('users').findOne({ token: send });
        const userReceive = await db.collection('users').findOne({ username: receive });

        const roomKey = createRoomKey(userReceive._id.toString(), userSend._id.toString());
        let room = chatRoom.get(roomKey);

        if(room){
           await storeMessages(userSend, userReceive, message);
           let messages = await getMessages(userSend, userReceive);
           console.log('MESSAGES',messages);
           //changer tous les

            io.to(roomKey).emit('send chat friends response', JSON.stringify(messages))
        }
        else{
            console.error('Room not found');
        }
    });
}