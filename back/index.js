const http = require('http');
const { MongoClient } = require('mongodb');
const setupSocketServer = require('./sockerServer');
const mainRouter = require('./logic/Router/MainRouter');
const { PORT, MONGO_URL } = require('./logic/Utils/constants'); // Assurez-vous d'ajouter MONGO_URL dans vos constants

const client = new MongoClient(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

async function startServer() {
    try {
        await client.connect();
        console.log('Connecté à la base de données MongoDB');

        const db = client.db(); // Ajoutez la logique nécessaire pour utiliser 'db'
        const server = http.createServer((req, res) => {
            // Vous pouvez passer 'db' à mainRouter si nécessaire
            mainRouter.handle(req, res);
            console.log("j'attends les requetes");
        });

        setupSocketServer(server);

        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Erreur de connexion à MongoDB', err);
    }
}

startServer();
