const { parseJSON } = require('../Utils/utils'); // Assurez-vous d'importer correctement
const { MongoClient } = require("mongodb");
const { MONGO_URL } = require("../Utils/constants");

const client = new MongoClient(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

async function sendFriendRequest(req, res) {
    parseJSON(req, async (err, data) => {
        if (err) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON');
            return;
        }
        const { token, username } = data;

        try {
            await client.connect();
            const db = client.db();

            const userExists = await db.collection('users').findOne({ token: token });
            const friendExists = await db.collection('users').findOne({ username: username });

            if (!userExists || !friendExists) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('User not found');
                return;
            }

            const requestExists = await db.collection('friendRequests').findOne({ userId: userExists._id, friendId: friendExists._id });
            if (requestExists) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Friend request already exists');
                return;
            }

            await db.collection('friendRequests').insertOne({ userId: userExists._id, friendId: friendExists._id, status: 'pending' });
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Friend request sent successfully' }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error sending friend request');
            console.error('Error sending friend request', error);
        } finally {
            await client.close();
        }
    });
}

async function acceptFriendRequest(req, res) {
    parseJSON(req, async (err, data) => {
        if (err) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON');
            return;
        }
        console.log("Accepting friend request");
        console.log(data);
        const { token, username } = data;

        try {
            await client.connect();
            const db = client.db();

            const userAccepting = await db.collection('users').findOne({ token: token });
            const userWhoSentRequest = await db.collection('users').findOne({ username: username });

            if (!userAccepting || !userWhoSentRequest) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('User not found');
                return;
            }

            const request = await db.collection('friendRequests').findOne({ userId: userWhoSentRequest._id, friendId: userAccepting._id, status: 'pending' });

            if (!request) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Friend request not found');
                return;
            }

            await db.collection('friendRequests').updateOne({ _id: request._id }, { $set: { status: 'accepted' } });
            await db.collection('friends').insertMany([{ userId: request.userId, friendId: request.friendId }, { userId: request.friendId, friendId: request.userId }]);

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Friend request accepted' }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error accepting friend request');
            console.error('Error accepting friend request', error);
        } finally {
            await client.close();
        }
    });
}


async function rejectFriendRequest(req, res) {
    parseJSON(req, async (err, data) => {
        if (err) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON');
            return;
        }
        console.log("REJECTING friend request");


        const { token, username } = data;

        try {
            await client.connect();
            const db = client.db();

            const userRejecting = await db.collection('users').findOne({ token: token });
            const userWhoSentRequest = await db.collection('users').findOne({ username: username });

            if (!userRejecting || !userWhoSentRequest) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('User not found');
                return;
            }

            const request = await db.collection('friendRequests').findOne({ userId: userWhoSentRequest._id, friendId: userRejecting._id });

            if (!request) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Friend request not found');
                return;
            }

            await db.collection('friendRequests').deleteOne({ _id: request._id });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Friend request rejected' }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error rejecting friend request');
            console.error('Error rejecting friend request', error);
        } finally {
            await client.close();
        }
    });
}



async function listFriends(req, res) {
    // Supposons que 'extractToken' est une fonction qui extrait le token des headers
    const token = extractToken(req.headers.authorization);
    console.log(token);

    try {
        await client.connect();
        const db = client.db();
        const user = await db.collection('users').findOne({ token: token });

        if (!user) {
            res.writeHead(401, { 'Content-Type': 'text/plain' });
            res.end('Unauthorized');
            return;
        }

        const userId = user._id;

        // Récupérer tous les documents où userId est l'ID de l'utilisateur
        const friends = await db.collection('friends').find({ userId }).toArray();

        // Extraire les friendId de la liste des amis
        const friendIds = friends.map(friend => friend.friendId);

        // Récupérer les informations des amis depuis la collection des utilisateurs
        const friendsList = await db.collection('users').find({ _id: { $in: friendIds } }).toArray();

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(friendsList)); // Envoyer la liste des amis au client
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error fetching friends');
        console.error('Error fetching friends', error);
    } finally {
        await client.close();
    }
}
async function listFriendRequests(req, res) {
    const token = extractToken(req.headers.authorization);

    try {
        await client.connect();
        const db = client.db();
        const user = await db.collection('users').findOne({ token: token });

        if (!user) {
            res.writeHead(401, { 'Content-Type': 'text/plain' });
            res.end('Unauthorized');
            return;
        }

        const userId = user._id;

        // Récupérer toutes les demandes d'ami en attente pour cet utilisateur
        const friendRequests = await db.collection('friendRequests').find({ friendId: userId, status: 'pending' }).toArray();

        // Extraire les userId de la liste des demandes d'amis
        const requesterIds = friendRequests.map(request => request.userId);

        // Récupérer les informations des utilisateurs qui ont envoyé une demande d'ami
        const requestersList = await db.collection('users').find({ _id: { $in: requesterIds } }).toArray();

        // Formatter la liste pour le client
        const formattedList = requestersList.map(requester => ({
            username: requester.username,
            id: requester._id
        }));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(formattedList)); // Envoyer la liste des demandes d'amis au client
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error fetching friend requests');
        console.error('Error fetching friend requests', error);
    } finally {
        await client.close();
    }
}


function extractToken(header) {
    if (!header) return null;
    const parts = header.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') return parts[1];
    return null;
}

module.exports = { listFriendRequests,sendFriendRequest, listFriends,rejectFriendRequest,acceptFriendRequest };
