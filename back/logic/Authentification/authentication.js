// authentication.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY } = require('../Utils/constants');

module.exports.generateToken = (username) => {
    return jwt.sign({ username }, JWT_SECRET_KEY);
};