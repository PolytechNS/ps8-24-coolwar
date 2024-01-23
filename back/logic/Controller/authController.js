// controllers/authController.js
const { generateToken } = require('../Authentification/authentication');
const { parseJSON } = require('../Utils/utils'); // Ensure you have a utility to parse JSON

function signup(req, res) {
    parseJSON(req, (err, { username, password }) => {
        if (err) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON');
            return;
        }
        // Your signup logic here...
        const token = generateToken(username);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ token }));
    });
}

function login(req, res) {
    parseJSON(req, (err, { username, password }) => {
        if (err) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON');
            return;
        }
        // Your login logic here...
        const token = generateToken(username);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ token }));
    });
}

module.exports = { signup, login };