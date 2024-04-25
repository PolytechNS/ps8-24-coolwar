const userController = require("../Controller/userController");


function handleUserRoutes(req, res,db) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === '/api/users/leaderboard' && req.method === 'GET') {
        userController.getLeaderBoard(req, res, db);
    }
    else if(url.pathname === '/api/users/skins' && req.method === 'GET'){
        userController.getSkinsUser(req, res, db);
    }
    else if(url.pathname === '/api/users/notifications' && req.method === 'GET'){
        userController.getNotifications(req, res, db);
    }
    else if(url.pathname === '/api/users/removeNotifications' && req.method === 'POST'){
        userController.removeNotification(req, res, db);
    }
    else if(url.pathname === '/api/users/activateWatch' && req.method === 'POST'){
        userController.activateWatch(req, res, db);
    }


}

module.exports = handleUserRoutes;