const friendsController = require("../Controller/friendsController");

function handleFriendsRoutes(req, res,db) {
    // You might want to parse the URL and method more carefully in a production app
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === '/api/friends/sendRequest' && req.method === 'POST') {
        friendsController.sendFriendRequest(req, res, db);
    }else if (url.pathname === '/api/friends/list' && req.method === 'GET') {
        friendsController.listFriends(req, res, db);

    }else if (url.pathname === '/api/friends/acceptRequest' && req.method === 'POST') {
        friendsController.acceptFriendRequest(req, res, db);
    }
    else if (url.pathname === '/api/friends/rejectRequest' && req.method === 'POST') {
        friendsController.rejectFriendRequest(req, res, db);
    }
    else if (url.pathname === '/api/friends/listRequest' && req.method === 'GET') {
        friendsController.listFriendRequests(req, res, db);
    }
    else {
        // Not Found
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
}

module.exports = handleFriendsRoutes;