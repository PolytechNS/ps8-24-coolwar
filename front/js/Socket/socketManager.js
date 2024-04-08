import "../socket.io.js";
import "../Utils/config.js"
import {GamePresenter} from "../Game/Controllers/GamePresenter.js";
import {ChatServiceInGame} from "../Services/Chat/chatServiceInGame.js";
import {config} from "../Utils/config";
// socketManager.js
export const socketManager = {
    socket: null,
    initializeSocket(token) {
        this.socket = io(config.API_ENDPOINT, {
            auth: { token },
        });

        this.socket.on('connect', () => {
            console.log('Connected to the server');
            console.log('Socket id:', this.socket.id);

            // Peut-être déclencher un événement personnalisé ou exécuter un callback ici pour indiquer que la socket est prête
            this.socket.emit('authenticate', token);
        });

        this.socket.on('connect_error', (err) => {
            console.log('Connection failed', err.message);
        });



        this.socket.on("test", (res) => {
            console.log("test PTN",res);
        });


    },

    // Ajoutez une méthode pour vérifier si la socket est initialisée
    isSocketInitialized() {
        return this.socket !== null && this.socket.connected;
    },
};

