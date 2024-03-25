const { parseJSON } = require('../Utils/utils'); // Assurez-vous d'importer correctement
const { MongoClient, ObjectId} = require("mongodb");
const { MONGO_URL, exp_earned_bot, exp_earned_online,
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
        if(typeGame === withBot ){
            newExp = user.exp + exp_earned_bot;

        }else{
            newExp = user.exp + exp_earned_online;
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
        await db.collection('users').updateOne({ _id: new ObjectId(player1.userId)}, { $set: { exp: newExp } });
        let newExp2 = play2Db.exp + ex_earned_online_looser;
        await db.collection('users').updateOne({ _id: new ObjectId(player2.userId) }, { $set: { exp: newExp2 } });

    }
    else{
        let newExp = play1Db.exp + exp_earned_bot;
        await db.collection('users').updateOne({ _id: new ObjectId(player1.userId) }, { $set: { exp: newExp } });
        let newExp2 = play2Db.exp + ex_earned_bot_looser;
        await db.collection('users').updateOne({_id: new ObjectId(player2.userId) }, { $set: { exp: newExp2 } });
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


module.exports = {
    addExpToPlayerWithBot,
    manageEndGameUser
};