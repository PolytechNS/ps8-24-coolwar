import "../socket.io.js";
export const socketManager = {
    socket: null,
    initializeSocket(token) {
        this.socket = io('http://localhost:3000', {
            auth: { token },
        });

        this.socket.on('connect', () => {
            console.log('Connected to the server');
            console.log('Socket id:', this.socket.id);
            this.socket.emit('start game', { /* game options */ });
        });

        this.socket.on('connect_error', (err) => {
            console.log('Connection failed', err.message);
        });

    },
};
