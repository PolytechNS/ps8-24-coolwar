    // AJOUTER ICI CHAQUES ROUTER
    const authRouter = require('./authRouter');
    const fs = require('fs');
    const fileManager = require('../Utils/front');
    const friendsRouter = require('./friendsRouter');

    function mainRouter(req, res, db) {

        // Handle the authentication routing
        if (req.url.startsWith('/api/auth')) {
            authRouter(req, res, db);
            return; // Stop further execution after handling /api/auth
        }
        if(req.url.startsWith('/api/friends')){
            friendsRouter(req, res, db);
            return;
        }

        // Serve the index.html file for the base route
        if(req.url === '/' || req.url === '') {
            fs.readFile('./front/Pages/WelcomePage/WelcomePage.html', function(err, data) {
                if (err) {
                    res.writeHead(500);
                    res.end('Error loading index.html');
                    return; // Stop further execution in case of error
                }
                res.setHeader('Content-Type', 'text/html');
                res.writeHead(200);
                res.end(data);
            });
        } else {
            // All other requests are handled by the fileManager
            fileManager.manage(req, res);
        }
    }


    module.exports = { handle: mainRouter };

