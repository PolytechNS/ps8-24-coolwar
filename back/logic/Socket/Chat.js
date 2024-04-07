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
        const { send, receive} = JSON.parse(data);

        await client.connect();
        const db = client.db();
        const userSend = await db.collection('users').findOne({ token: send });
        const userReceive = await db.collection('users').findOne({ token: receive });

        const roomKey = createRoomKey(userReceive._id.toString(), userSend._id.toString());
        let room = chatRoom.get(roomKey);

        if (!room) {
            room = { user1: userReceive._id, user2: userSend._id};
            chatRoom.set(roomKey, room);
            socket.join(roomKey);
            let message = await getMessages(userSend._id, userReceive._id);
            console.log('room created');
            io.to(roomKey).emit('join chat friends response',JSON.stringify(message));
        }else{
            socket.join(roomKey);
            let message = await getMessages(userSend._id, userReceive._id);

            io.to(roomKey).emit('join chat friends',JSON.stringify(message));
        }
    });

    socket.on('send chat friends', async (data) => {
        const { send, receive, message } = JSON.parse(data);
        await client.connect();
        const db = client.db();
        const userSend = await db.collection('users').findOne({ token: send });
        const userReceive = await db.collection('users').findOne({ token: receive });

        const roomKey = createRoomKey(userReceive._id.toString(), userSend._id.toString());
        let room = chatRoom.get(roomKey);

        if(room){
           await storeMessages(userSend, userReceive, message);
           let messages = await getMessages(userSend, userReceive);
              io.to(roomKey).emit('send chat friends response',JSON.stringify(messages));
        }
        else{
            console.error('Room not found');
        }
    });
}