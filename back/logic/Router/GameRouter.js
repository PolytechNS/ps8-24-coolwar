const friendsController = require("../Controller/friendsController");
const creatingGameController = require("../Controller/creatingGameController");

function handleGameRoutes(req, res,db) {
    // You might want to parse the URL and method more carefully in a production app
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === '/api/game/createGame' && req.method === 'POST') {
        console.log("Creating game");
        creatingGameController.createGame(req, res, db);
    }
    else {
        // Not Found
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
}

module.exports = handleGameRoutes;