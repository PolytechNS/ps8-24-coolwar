import { friendsService } from '../Services/Friends/friendsService.js'; // Assurez-vous que le chemin est correct

// chatFriends.js

// Assuming that `friendsService.listFriends` is a function that fetches the list of friends
// and returns a promise that resolves to an array of friend objects.

document.getElementById('send-chat-message').addEventListener('click', () => {
    const messageInput = document.getElementById('chat-input');
    const message = messageInput.value;
    console.log(`Sending message: ${message}`);
    messageInput.value = ''; // Clear the input after sending
});

document.addEventListener('DOMContentLoaded', () => {
    const chatButton = document.getElementById('chat-button');
    const friendsListDiv = document.getElementById('friends-list');
    const chatInterface = document.getElementById('chat-interface');
    const backToFriendsListButton = document.getElementById('back-to-friends-list');
    const sendMessageButton = document.getElementById('send-message-button');
    const messageInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const friendNameSpan = document.getElementById('chat-with-friend-name');

    // Event listener for the chat button.
    chatButton.addEventListener('click', () => {
        const isHidden = friendsListDiv.classList.contains('hidden');
        if (isHidden) {
            loadFriendsList();
            friendsListDiv.classList.remove('hidden');
        } else {
            friendsListDiv.classList.add('hidden');
        }
    });

    // Function to load the friends list.
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
        friendNameSpan.textContent = friend.username; // Set the friend's name
        chatInterface.style.display = 'block'; // Show the chat interface
        friendsListDiv.style.display = 'none'; // Hide the friends list
    }

    // Event listener for the back button in chat interface.
    backToFriendsListButton.addEventListener('click', () => {
        chatInterface.style.display = 'none'; // Hide the chat interface
        friendsListDiv.style.display = 'block'; // Show the friends list
    });

    // Event listener for the send message button in the chat interface.
    sendMessageButton.addEventListener('click', () => {
        const message = messageInput.value.trim();
        if (message) {
            console.log(`Sending message to ${friendNameSpan.textContent}: ${message}`);
            // Here you would send the message to the server
            // For now, we just clear the input and log the message
            messageInput.value = '';

            // Add the message to the chat display
            const messageDiv = document.createElement('div');
            messageDiv.textContent = message;
            chatMessages.appendChild(messageDiv);
        }
    });
});



