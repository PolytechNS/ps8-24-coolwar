const { parseJSON } = require('../Utils/utils'); // Assurez-vous d'importer correctement
const { MongoClient, ObjectId} = require("mongodb");
const { MONGO_URL, exp_earned_bot, exp_earned_online, trophies_earned_online
    , trophies_lost_online,
    withBot,
    withFriends, ex_earned_bot_looser, ex_earned_online_looser } = require("../Utils/constants");

const client = new MongoClient(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

async function addExpToPlayerWithBot(token, typeGame) {
    try {
        await client.connect();
        const db = client.db();

        const user = await db.collection('users').findOne({ token });
        if (!user) {
            return { success: false, message: 'User not found' };
        }
        let newExp;
        if(winner ===1){
            newExp = user.exp + exp_earned_bot;
        }
        else{
            newExp = user.exp + ex_earned_bot_looser;
        }
        await db.collection('users').updateOne({ token }, { $set: { exp: newExp } });
        manageLvl(token);

        return { success: true, message: 'Experience added successfully' };
    } catch (error) {
        console.error('Error adding experience to player', error);
        return { success: false, message: 'Error adding experience to player' };
    }
}

    async function manageEndGameUser(gameId, winner,looser) {
    await client.connect();
    const db = client.db();
    let gameBoard = await db.collection('gameboards').findOne({ gameId: new ObjectId(gameId) });
    console.log("gameBoard", gameBoard);
    let players = await db.collection('character').find({gameBoardId: new ObjectId(gameBoard._id)}).toArray();
    console.log("players", players);
    let player1 = players.find(player => player.currentPlayerIndex === 1);
    console.log("player1", player1);
    let player2 = players.find(player => player.currentPlayerIndex === 2);
    console.log("player2", player2);
    let play1Db = await db.collection('users').findOne({_id: new ObjectId(player1.userId)});
    let play2Db = await db.collection('users').findOne({_id: new ObjectId(player2.userId)});
    console.log("play1Db", play1Db);
    console.log("play2Db", play2Db);
    //checker qui est winner
    if(winner === 1){
        let newExp = play1Db.exp + exp_earned_online;
        let newWins = play1Db.wins + 1;
        let newTro = play1Db.trophies + trophies_earned_online;
        let newLosses = play2Db.losses + 1;

        let newTro2 = play2Db.trophies + trophies_lost_online;
        if(newTro2<0){
            newTro2 = 0;
        }
        await db.collection('users').updateOne({ _id: new ObjectId(player1.userId)}, { $set: { exp: newExp, wins:newWins, trophies:newTro } });
        let newExp2 = play2Db.exp + ex_earned_online_looser;
        await db.collection('users').updateOne({ _id: new ObjectId(player2.userId) }, { $set: { exp: newExp2, losses: newLosses,trophies:newTro2 } });

    }
    else{
        let newExp = play1Db.exp + ex_earned_online_looser;
        let newTro = play1Db.trophies + trophies_lost_online;
        if(newTro<0){
            newTro = 0;
        }
        let newWins = play2Db.wins + 1;
        let newLosses = play1Db.losses + 1;
        let newTro2 = play2Db.trophies + trophies_earned_online;
        await db.collection('users').updateOne({ _id: new ObjectId(player1.userId) }, { $set: { exp: newExp, wins :newWins, trophies:newTro } });
        let newExp2 = play2Db.exp + exp_earned_online;
        await db.collection('users').updateOne({_id: new ObjectId(player2.userId) }, { $set: { exp: newExp2, losses:newLosses, trophies:newTro2 } });
    }
    manageLvl(play1Db.token);
    manageLvl(play2Db.token);

}

async function manageLvl(token) {
    try {
        await client.connect();
        const db = client.db();
        const user = await db.collection('users').findOne({ token });
        if (!user) {
            return { success: false, message: 'User not found' };
        }

        // Constantes pour la formule de calcul du niveau
        const expBase = 100; // Expérience nécessaire pour le premier niveau
        const expFactor = 1.5; // Facteur d'augmentation de l'expérience nécessaire

        // Calcul du nouveau niveau basé sur l'expérience
        let newLvl = Math.floor(Math.log(user.exp / expBase) / Math.log(expFactor)) + 1;

        // Vérifiez si le niveau a augmenté
        if (newLvl > user.lvl) {
            await db.collection('users').updateOne({ token }, { $set: { lvl: newLvl } });
            console.log('Level updated successfully : ', newLvl);
            console.log('Experience : ', user.exp);
            return { success: true, message: 'Level updated successfully' };
        } else {
            return { success: true, message: 'Experience added, but level remains the same' };
        }
    } catch (error) {
        console.error('Error updating level of player', error);
        return { success: false, message: 'Error updating level of player' };
    }
}

async function checkAchievements(token) {
    try {
        await client.connect();
        const db = client.db();
        const user = await db.collection('users').findOne({ token });
        if (!user) {
            return { success: false, message: 'User not found' };
        }

        const achievements = user.achievements || [];
        let unlockedAchievements = []; // Pour stocker les achievements débloqués

        // Vérifier chaque condition d'achievement et mettre à jour le tableau des débloqués
        if (!achievements.includes('first_win.png') && user.wins > 0) {
            await db.collection('users').updateOne({ token }, { $push: { achievements: 'first_win.png' } });
            unlockedAchievements.push('first_win.png');
        }

        if (!achievements.includes('tu_fais_le_fou.jpg') && user.wins > 9) {
            await db.collection('users').updateOne({ token }, { $push: { achievements: 'tu_fais_le_fou.jpg' } });
            unlockedAchievements.push('tu_fais_le_fou.jpg');
        }

        // ... Ajoutez d'autres vérifications d'achievements ici ...

        // Si des achievements ont été débloqués, retournez-les
        if (unlockedAchievements.length > 0) {
            return { success: true, achievements: unlockedAchievements, message: 'New achievements unlocked' };
        }

        // Si aucun nouvel achievement n'a été débloqué
        return { success: true, achievements: [], message: 'No new achievements unlocked' };
    } catch (error) {
        console.error('Error checking achievements of player', error);
        return { success: false, message: 'Error checking achievements of player', error: error };
    }
}

async function storeMessages(userSender, userReceiver, messageText) {
    await client.connect();
    const db = client.db();


    if (!userReceiver || !userSender) {
        return { success: false, message: 'One or both users not found' };
    }

    // Créer un ID de conversation basé sur les IDs des deux utilisateurs
    const conversationId = [userSender._id, userReceiver._id].sort().join('_');

    // Préparer le document message à insérer
    const message = {
        sender: userSender._id,
        receiver: userReceiver._id,
        message: messageText,
        createdAt: new Date() // Stocke la date actuelle
    };

    // Insérer ou mettre à jour la conversation existante avec le nouveau message
    const updateResult = await db.collection('conversations').updateOne(
        { conversationId: conversationId }, // Utilise un champ différent pour l'ID de conversation
        {
            $push: { messages: message },
            $setOnInsert: { users: [userSender._id, userReceiver._id] }
        },
        { upsert: true } // Créer une nouvelle conversation si elle n'existe pas
    );

    if (updateResult.modifiedCount === 1 || updateResult.upsertedCount === 1) {
        return { success: true, message: 'Message stored successfully' };
    } else {
        return { success: false, message: 'Failed to store the message' };
    }
}

async function getMessages(userSender, userReceiver) {
    await client.connect();
    const db = client.db();

    if (!userSender || !userReceiver) {
        return { success: false, message: 'One or both users not found' };
    }

    // Utiliser le même format de conversationId que dans storeMessages pour correspondre à la conversation
    const conversationId = [userSender._id, userReceiver._id].sort().join('_');

    // Rechercher la conversation par son ID
    const conversation = await db.collection('conversations').findOne({ conversationId: conversationId });

    // Si la conversation est trouvée
    if (conversation && conversation.messages) {
        // Itérer sur chaque message pour remplacer les ObjectId par les usernames
        const messagesWithUsernames = await Promise.all(conversation.messages.map(async (message) => {
            const senderUser = await db.collection('users').findOne({ _id: message.sender });
            const receiverUser = await db.collection('users').findOne({ _id: message.receiver });

            // Remplacer les ObjectId par les usernames dans le message
            return {
                ...message,
                sender: senderUser ? senderUser.username : "Unknown sender",
                receiver: receiverUser ? receiverUser.username : "Unknown receiver",
            };
        }));

        return { success: true, messages: messagesWithUsernames };
    } else {
        return { success: false, message: 'No conversation found' };
    }
}

async function getLeaderBoard(req, res, db) {
    console.log("getLeaderBoard");
    // Utilisez `.project()` pour spécifier les champs à exclure
    const users = await db.collection('users')
        .find({})
        .project({ _id: 0, password: 0 }) // 0 pour exclure, 1 pour inclure
        .sort({ trophies: -1 })
        .limit(10)
        .toArray();
    console.log("users", users);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ users }));
}

async function activateWatch(req, res, db) {
    parseJSON(req, async (err, data) => {
        if (err) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON');
            return;
        }

        const { token, watch } = data;

        if (!token || !watch) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Missing token or watch');
            return;
        }

        try {
            const user = await db.collection('users').findOne({ token });
            if (!user) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('User not found');
                return;
            }

            await db.collection('users').updateOne({ token }, { $set: { watch } });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Watch activated successfully' }));
        } catch (error) {
            console.error('Error activating watch', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error activating watch');
        }
    });
}


let skinsServer = ["perso1", "perso2", "perso3", "perso4", "perso5", "perso6", "perso7", "perso8", "perso9"];
async function getSkinsUser(req,res,db) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    // Supposons que l'en-tête est de la forme "Bearer TOKEN"
    const token = authHeader.split(' ')[1]; // Cela sépare "Bearer" du token et prend le token

    console.log("token dans getSkinsUser", token);
    const user = await db.collection('users').findOne({ token });
    if (!user) {
        return { success: false, message: 'User not found' };
    }

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, userSkins: user.skins, allSkins: skinsServer }));

}

async function getNotifications(req, res, db) {
    const authHeader = req.headers.authorization;
    console.log("GET NOIFICATIONS", authHeader);
    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    // Supposons que l'en-tête est de la forme "Bearer TOKEN"
    const token = authHeader.split(' ')[1]; // Cela sépare "Bearer" du token et prend le token

    console.log("token dans get notifications", token);
    const user = await db.collection('users').findOne({ token:token });
    const notifications = await db.collection('notifications').find({ to: user._id }).toArray();

    if (!user) {
        return { success: false, message: 'User not found' };
    }
    console.log("les notifications", notifications);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, notifications }));
}

async function removeNotification(req, res, db) {
    parseJSON(req, async (err, data) => {
        if (err) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON');
            return;
        }
        console.log("data", data);
        const { typeNotification } = data;
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.writeHead(401, { 'Content-Type': 'text/plain' });
            res.end("No token provided");
            return;
        }

        console.log("REMOVING NOTIFICATIONS");
        const token = authHeader.split(' ')[1];

        try {
            const user = await db.collection('users').findOne({ token: token });

            const deleteResult = await db.collection('notifications').deleteMany({
                to: user._id,
                type: typeNotification
            });


            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Notifications removed" }));
        } catch (error) {
            console.error('Error removing notifications', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end("Error removing notifications");
        }
    });
}







module.exports = {
    addExpToPlayerWithBot,
    manageEndGameUser,
    checkAchievements,
    storeMessages,
    getMessages,
    getLeaderBoard,
    getSkinsUser,
    getNotifications,
    removeNotification
};