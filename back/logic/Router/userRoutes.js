const userController = require("../Controller/userController");


function handleUserRoutes(req, res,db) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === '/api/users/leaderboard' && req.method === 'GET') {
        userController.getLeaderBoard(req, res, db);
    }

}

module.exports = handleUserRoutes;