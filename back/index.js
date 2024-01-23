// server.js
const http = require('http');
const setupSocketServer = require('./sockerServer');
const mainRouter = require('./logic/Router/MainRouter');
const { PORT } = require('./logic/Utils/constants');

const server = http.createServer((req, res) => {
    // Delegate the request to the mainRouter
    mainRouter.handle(req, res);
});

setupSocketServer(server);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
