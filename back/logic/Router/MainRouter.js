    // AJOUTER ICI CHAQUES ROUTER
    const authRouter = require('./authRouter');
    const fs = require('fs');
    const fileManager = require('../Utils/front');

    function mainRouter(req, res, db) {
        console.log(req.url);

        // Handle the authentication routing
        if (req.url.startsWith('/api/auth')) {
            console.log('AUTH Request for /api/auth received');
            authRouter(req, res, db);
            return; // Stop further execution after handling /api/auth
        }

        // Serve the index.html file for the base route
        if(req.url === '/' || req.url === '') {
            console.log('IF Request for / received');
            fs.readFile('./front/index.html', function(err, data) {
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
            console.log('ELSE Request for ' + req.url + ' received');
            // All other requests are handled by the fileManager
            fileManager.manage(req, res);
        }
    }


    module.exports = { handle: mainRouter };

