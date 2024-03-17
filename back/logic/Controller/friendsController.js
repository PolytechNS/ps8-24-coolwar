const { parseJSON } = require('../Utils/utils'); // Assurez-vous d'importer correctement
const { MongoClient } = require("mongodb");
const { MONGO_URL } = require("../Utils/constants");

const client = new MongoClient(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

async function addFriend(req, res, db) {
    parseJSON(req, async (err, data) => {
        if (err) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON');
            return;
        }
        console.log(data);
        const { token, username } = data; // Supposons que ces propriétés sont envoyées avec la requête

        try {
            await client.connect();
            const db = client.db();

            // Vérifier si l'utilisateur et l'ami existent
            const userExists = await db.collection('users').findOne({ token: token });
            const friendExists = await db.collection('users').findOne({ username });

            if (!userExists || !friendExists) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('User not found');
                return;
            }

            // Vérifier si la relation d'amitié existe déjà
            const friendshipExists = await db.collection('friends').findOne({ userId:userExists._id, friendId:friendExists._id });
            if (friendshipExists) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Friendship already exists');
                return;
            }

            // Insérer une nouvelle relation d'amitié
            await db.collection('friends').insertOne({ userId: userExists._id, friendId : friendExists._id });
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Friend added successfully' }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error adding friend');
            console.error('Error adding friend', error);
        } finally {
            await client.close(); // Important : fermez la connexion après l'utilisation
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

function extractToken(header) {
    if (!header) return null;
    const parts = header.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') return parts[1];
    return null;
}

module.exports = { addFriend, listFriends};
