// AJOUTER ICI CHAQUES ROUTER
const authRouter = require('./authRouter');
const gameRouter = require('./gameRouter');
function mainRouter(req, res,db) {
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
        return;
    }
    //UN IF = UN DEBUT DE LIEN DIFFERENT
    if (req.url.startsWith('/api/auth')) {
        authRouter(req, res,db);
    }
    else if(req.url.startsWith('/api/game')){
        gameRouter(req,res,db);
    }
    else {
        // Handle other routes or return 404
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
}

module.exports = { handle: mainRouter };