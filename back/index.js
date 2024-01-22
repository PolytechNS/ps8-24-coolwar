const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

// Clé secrète pour JWT. Dans une application réelle, utilisez une clé plus sécurisée et la stockez en dehors du code source.
const JWT_SECRET_KEY = 'your_secret_key';

// Création d'un serveur HTTP
const server = http.createServer((req, res) => {
    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            // Assurez-vous que l'en-tête CORS est présent sur toutes les réponses
            res.setHeader('Access-Control-Allow-Origin', '*');
            try {
                const userData = JSON.parse(body);
                if (req.url === '/api/signup') {
                    // Logique d'inscription...
                    const token = jwt.sign({ email: userData.email, username: userData.username }, JWT_SECRET_KEY);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ token }));
                } else if (req.url === '/api/login') {
                    // Logique de connexion...
                    const token = jwt.sign({ email: userData.email }, JWT_SECRET_KEY);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ token }));
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Not Found');
                }
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Invalid JSON');
            }
        });
    } else {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method Not Allowed');
    }
});

// Création et configuration du serveur Socket.io
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:63342", // ou spécifiez "http://localhost:63342" si vous voulez être plus restrictif
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });

    // Plus de gestionnaires d'événements socket...
});

// Démarrage du serveur HTTP (et WebSocket avec Socket.io)
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
