// controllers/authController.js
const { generateToken } = require('../Authentification/authentication');
const { parseJSON } = require('../Utils/utils');


let profilesPictures = ["profile8", "profile1","profile2","profile3","profile4","profile5","profile6","profile7"]

function signup(req, res, db) {
    parseJSON(req, async (err, { username, password }) => {
        if (err) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON');
            return;
        }
        // Insérer un nouvel utilisateur
        try {
            const token = generateToken(username);
            if(await db.collection('users').findOne({ username })){
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('User already exist');
                console.log('User already exist');
                return;
            }
            let profilePicture = profilesPictures[Math.floor(Math.random() * profilesPictures.length)];
            const result = await db.collection('users').insertOne({
                username,
                token : token,
                password, // Encore une fois, le mot de passe devrait être hashé.
                lvl: 0,
                exp: 0,
                elo: 0,
                wins: 0,
                losses: 0,
                trophies: 0,
                skins: { current: 'defaultSkin', owned: ['defaultSkin'] },
                emotes: ['defaultEmote'],
                titles: [],
                achievements: [],
                profilePicture: profilePicture,

            });
            console.log('Utilisateur créé', result);

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ token }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Erreur lors de la création de l’utilisateur');
            console.error('Erreur lors de la création de l’utilisateur', error);
        }
    });
}

function login(req, res, db) {
    parseJSON(req, async (err, { username, password }) => {
        if (err) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON');
            return;
        }
        // Vérifier l'existence de l'utilisateur et le mot de passe
        try {
            const user = await db.collection('users').findOne({ username });
            if (user && user.password === password) {
                //const token = generateToken(user.username);
                //const result = await db.collection('users').updateOne({ username, password }, { $set: { token } });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ token : user.token }));
            } else {
                res.writeHead(401, { 'Content-Type': 'text/plain' });
                res.end('Échec de la connexion');
            }
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Erreur lors de la connexion');
            console.error('Erreur lors de la connexion', error);
        }
    });
}

module.exports = { signup, login };