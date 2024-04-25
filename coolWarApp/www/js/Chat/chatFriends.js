import { friendsService } from '../Services/Friends/friendsService.js'; // Assurez-vous que le chemin est correct
import {ChatServiceFriends} from '../Services/Chat/chatServiceFriends.js';
import {socketManager} from "../Socket/socketManager.js"; // Assurez-vous que le chemin est correct
// chatFriends.js

// Assuming that `friendsService.listFriends` is a function that fetches the list of friends
// and returns a promise that resolves to an array of friend objects.


document.addEventListener('DOMContentLoaded', () => {
    const chatButton = document.getElementById('chat-button');
    const friendsListDiv = document.getElementById('friends-list');
    const chatInterface = document.getElementById('chat-interface');
    const backToFriendsListButton = document.getElementById('back-to-friends-list');
    const sendMessageButton = document.getElementById('send-chat-message');
    const messageInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const friendNameSpan = document.getElementById('chat-with-friend-name');
    const chatContainer = document.getElementById('chat-container');
    const inviteFriend = document.getElementById('invite-friend-button');

    chatButton.addEventListener('click', () => {
        const isHidden = friendsListDiv.classList.contains('hidden');
        if (isHidden) {
            friendsListDiv.style.display = 'block';
            loadFriendsList();
            friendsListDiv.classList.remove('hidden');
        } else {
            friendsListDiv.classList.add('hidden');
            friendsListDiv.style.display = 'none';
        }
    });

    socketManager.socket.on('send chat friends response', handleMessages);

    socketManager.socket.on('error', (error) => {
        console.error('Socket encountered error:', error);
    });


    function loadFriendsList() {
        const token = localStorage.getItem('token'); // This should be your actual method to get the token
        if (!token) {
            console.error('No token found');
            return;
        }

        friendsService.listFriends(token)
            .then(friends => {
                friendsListDiv.innerHTML = ''; // Clear the friends list
                friends.forEach(friend => {
                    // Create each friend element
                    const friendDiv = document.createElement('div');
                    friendDiv.className = 'friend';
                    friendDiv.innerHTML = `<div class="friend-name">${friend.username}</div>`;
                    friendDiv.addEventListener('click', () => openSendMessagePopup(friend));
                    friendsListDiv.appendChild(friendDiv);
                });
            })
            .catch(error => {
                console.error('Error fetching friends:', error);
            });
    }

    function openSendMessagePopup(friend) {
        chatMessages.innerHTML = '';
        friendNameSpan.textContent = friend.username; // Set the friend's name
        chatInterface.style.display = 'block'; // Show the chat interface
        friendsListDiv.style.display = 'none'; // Hide the friends list
        chatContainer.style.display = 'none';

        //connecte à la room récupération des messages anciens et affichage
        ChatServiceFriends.connectToFriendRoom(friend.username, (data) => {
            console.log('Messages:', data);
        });
        //on pour écouter


    }

    inviteFriend.addEventListener('click', () => {
        friendsService.sendGameRequest(friendNameSpan.textContent, localStorage.getItem('token'))
            .then(() => {
                window.location.href = '../../../PlayPage/CreateGamePage/GameReadyPage/GameReadyPage.html';
                friendsService.sendNotificationToUser(friendNameSpan.textContent, localStorage.getItem('token'), "gameRequest");
            });
    });

    backToFriendsListButton.addEventListener('click', () => {
        chatInterface.style.display = 'none'; // Hide the chat interface
        friendsListDiv.style.display = 'block'; // Show the friends list
        chatContainer.style.display = 'block';
    });

    sendMessageButton.addEventListener('click', () => {
        const message = messageInput.value.trim();
        if (message) {
            console.log(`Sending message to ${friendNameSpan.textContent}: ${message}`);
            messageInput.value = '';
            ChatServiceFriends.sendChatMessage(friendNameSpan.textContent, message);
            console.log('Message sent');
            const messageDiv = document.createElement('div');
            messageDiv.textContent = message;
            chatMessages.appendChild(messageDiv);

            //envoie du message avec emit
        }
    });

    function scrollToBottomOfChat() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function handleMessages(data) {
        // Parse if data is JSON string
        if (typeof data === 'string') {
            data = JSON.parse(data);
        }

        console.log('Received messages:', data);
        // Clear the chatMessages div before appending new messages
        chatMessages.innerHTML = '';

        // Iterate over each message in the data and create a div for each
        data.messages.forEach((message) => {
            const messageDiv = document.createElement('div');
            // Apply a class for styling if needed
            messageDiv.classList.add('chat-message');

            // Since the sender is an ID, you would typically look up the user's name here.
            // For simplicity, I'm using the ID directly. You should replace it with actual username lookup.
            messageDiv.textContent = `${message.sender}: ${message.message}`;
            // Append the new div to the chatMessages container
            chatMessages.appendChild(messageDiv);
        });

        // Scroll to the bottom of the chat
        scrollToBottomOfChat();

    }
});





