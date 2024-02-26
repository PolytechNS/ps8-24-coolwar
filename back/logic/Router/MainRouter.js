    // AJOUTER ICI CHAQUES ROUTER
    const authRouter = require('./authRouter');
    const fs = require('fs');


    const baseFilePath = '/index.html';
    const baseFolder = './front';
    const mimeTypes = {
        '.ico': 'image/x-icon',
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.wav': 'audio/wav',
        '.mp3': 'audio/mpeg',
        '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.md': 'text/plain',
        'default': 'application/octet-stream'
    };

    function mainRouter(req, res, db) {
        console.log('Main router called');

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

        if(req.url.startsWith('/api')) {
            if (req.url.startsWith('/api/auth')) {
                authRouter(req, res, db);
                return; // Stop further execution after handling /api/auth
            }

            if(req.url.startsWith('/api/auth/login')) {
                fs.readFile('./front/js/Login/login.html', function(err, data) {

                    if (err) {
                        res.writeHead(404);
                        res.end('Error loading login.html');
                        return; // Stop further execution in case of error
                    }
                    console.log("login.html");
                    res.setHeader('Content-Type', 'text/jscript');
                    res.writeHead(200);
                    res.end(data);
                });
                return; // Assurez-vous d'arrêter l'exécution ici si cela correspond à votre logique d'application
            }
        }
        else{
            if(req.url.startsWith('/')) {
                // Si l'URL commence par '/', renvoyer le fichier index.html, sinon c'est sur une page mais on ne verifie pas si elle n'existe pas
                let url = req.url;
                if(url === '/'){
                    url = baseFilePath;
                }

                let extension = url.substring(url.lastIndexOf('.'));
                let mimeType = mimeTypes[extension] || mimeTypes['default'];

                fs.readFile(baseFolder + url, function(err, data) {
                    if (err) {
                        res.writeHead(404);
                        res.end(`Error loading ${url}`);
                        return; // Stop further execution in case of error
                    }

                    res.setHeader('Content-Type', mimeType);
                    res.writeHead(200);
                    res.end(data);
                });
                return; // Assurez-vous d'arrêter l'exécution ici si cela correspond à votre logique d'application
            }


        }

        // Si aucune des conditions précédentes n'est remplie, renvoyer 404
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }


    module.exports = { handle: mainRouter };

