// controllers/authController.js
const { generateToken } = require('../Authentification/authentication');
const { parseJSON } = require('../Utils/utils'); // Ensure you have a utility to parse JSON

function signup(req, res, db) {
    parseJSON(req, async (err, { username, password }) => {
        console.log('email', username);
        console.log('password', password);
        if (err) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON');
            return;
        }
        // Insérer un nouvel utilisateur
        try {
            const result = await db.collection('users').insertOne({ username, password });
            console.log('Utilisateur créé', result);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Utilisateur créé' }));
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
                const token = generateToken(user.email);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ token }));
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