import {socketManager} from "../../Socket/socketManager.js ";


export const ChatService = {
    sendChatMessage(roomId, message) {
        if (message.trim().length > 0) {
            console.log("roomId service",roomId);
            let token = localStorage.getItem('token');
            socketManager.socket.emit('sendChatMessage', JSON.stringify({ roomId, message,token }));
        }
    },

    appendMessageToChatbox(message, senderId, chatBoxId) {
    const chatMessages = document.getElementById(chatBoxId);
    let firstMessageUser = ''; // Garder une trace du premier utilisateur qui envoie un message

    // Vérifiez s'il y a déjà des messages dans le chat
    if (chatMessages.children.length > 0) {
        // Si déjà des messages, prenez le senderId du premier message pour identifier le premier utilisateur
        firstMessageUser = chatMessages.children[0].getAttribute('data-sender');
    } else {
        // Si pas de messages, ce message est le premier, donc ce senderId devient le premier utilisateur
        firstMessageUser = senderId;
    }

    const msgElement = document.createElement('div');
    msgElement.setAttribute('data-sender', senderId); // Stockez le senderId dans l'élément pour des vérifications ultérieures

    // Déterminez la couleur du message selon le senderId
    if (senderId === firstMessageUser) {
        msgElement.className = 'message firstUserMessage'; // Classe pour le premier utilisateur
    } else {
        msgElement.className = 'message secondUserMessage'; // Classe pour l'autre utilisateur
    }

    msgElement.textContent = `${senderId}: ${message}`;
    chatMessages.appendChild(msgElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

}