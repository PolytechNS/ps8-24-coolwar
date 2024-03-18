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

    // Créez un élément pour le message
    const msgElement = document.createElement('div');
    msgElement.textContent = `${senderId ? senderId + ': ' : ''}${message}`;

        if (!senderId) {
            msgElement.className = 'message errorMessage';
            msgElement.textContent = "Message non autorisé";
            chatMessages.appendChild(msgElement);
            setTimeout(() => {
                msgElement.classList.add('fade'); // Ajoutez la classe qui déclenche l'animation de fondu
            }, 2000); // Commencez à disparaître après 2 secondes

            // Retirez l'élément une fois que l'animation de fondu est terminée
            msgElement.addEventListener('transitionend', () => {
                chatMessages.removeChild(msgElement);
            });
        } else {
        // Gestion normale des messages
        let firstMessageUser = '';
        if (chatMessages.children.length > 0) {
            firstMessageUser = chatMessages.children[0].getAttribute('data-sender');
        } else {
            firstMessageUser = senderId;
        }
        msgElement.setAttribute('data-sender', senderId);
        if (senderId === firstMessageUser) {
            msgElement.className = 'message firstUserMessage';
        } else {
            msgElement.className = 'message secondUserMessage';
        }
    }

    // Ajoutez le message dans la zone de chat
    chatMessages.appendChild(msgElement);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Faites défiler vers le bas pour afficher le dernier message
}


}