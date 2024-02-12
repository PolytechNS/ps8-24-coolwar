const actionController = require('../Controller/actionController.js');

function handleAuthRoutes(req, res,db) {
    // You might want to parse the URL and method more carefully in a production app
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === '/api/game/moveCharacter' && req.method === 'POST') {
        actionController.ActionController.prototype.moveCharacter();
    } else if (url.pathname === '/api/game/placeWall' && req.method === 'POST') {
        authController.login(req, res,db);
    } else {
        // Not Found
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
}

module.exports = handleAuthRoutes;