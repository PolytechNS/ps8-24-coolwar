    // AJOUTER ICI CHAQUES ROUTER
    const authRouter = require('./authRouter');
    const fs = require('fs');

    function mainRouter(req, res, db) {
        console.log('Main router called');
        console.log(req.url);

        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

        // Handle preflight requests for CORS
        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return; // Stop further execution
        }

        if (req.url.startsWith('/api/auth')) {
            authRouter(req, res, db);
            return; // Stop further execution after handling /api/auth
        }

        if(req.url.startsWith('/')) {
            fs.readFile('./front/index.html', function(err, data) {
                if (err) {
                    res.writeHead(500);
                    res.end('Error loading index.html');
                    return; // Stop further execution in case of error
                }

                res.writeHead(200);
                res.end(data);
            });
            return; // Assurez-vous d'arrêter l'exécution ici si cela correspond à votre logique d'application
        }

        if(req.url.startsWith('/api/auth/login')) {
            fs.readFile('./front/js/Login/login.html', function(err, data) {

                if (err) {
                    res.writeHead(404);
                    res.end('Error loading login.html');
                    return; // Stop further execution in case of error
                }
                console.log("login.html");
                res.setHeader('Content-Type', 'application/javascript');
                res.writeHead(200);
                res.end(data);
            });
            return; // Assurez-vous d'arrêter l'exécution ici si cela correspond à votre logique d'application
        }

        // Si aucune des conditions précédentes n'est remplie, renvoyer 404
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }


    module.exports = { handle: mainRouter };

