const {ObjectId, MongoClient} = require("mongodb");
const {playBot} = require("./botController");
const {MONGO_URL} = require("../Utils/constants");
const {parseJSON} = require("../Utils/utils");
const client = new MongoClient(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });



async function createGame(req, res,db) {
    parseJSON(req, async (err, data) => {
        if (err) {
            res.writeHead(400, {'Content-Type': 'text/plain'});
            res.end('Invalid JSON');
            return;
        }

        console.log("data",data);


        let userToken = data.token;
        let gameName = data.gameName;
        let user = await client.db().collection('users').findOne({token: userToken});
        console.log("user creating game",user);
        //create game with the data like name and token of the user
        const newGame = await db.collection('games').insertOne({
            fog_of_war_on_or_off: false, // ou true, selon la logique de votre jeu
            creator_id: user._id, // ID de l'utilisateur qui a créé la partie
            typeGame: 'withFriends', // Type de partie
            game_name: gameName, // Nom de la partie, peut-être fourni par l'utilisateur
            createdAt: new Date()
        });
        ;
        console.log("newGame", newGame.insertedId);
        // Send the response
        res.writeHead(201, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({message: 'Game created successfully'}));
    });

}





module.exports = { createGame };