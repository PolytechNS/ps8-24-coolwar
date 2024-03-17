const friendsController = require("../Controller/friendsController");

function handleFriendsRoutes(req, res,db) {
    // You might want to parse the URL and method more carefully in a production app
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === '/api/friends/add' && req.method === 'POST') {
        friendsController.addFriend(req, res, db);
    }else if (url.pathname === '/api/friends/list' && req.method === 'GET') {
        friendsController.listFriends(req, res, db);

    } else {
        // Not Found
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
}

module.exports = handleFriendsRoutes;