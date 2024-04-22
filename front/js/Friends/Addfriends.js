import { friendsService } from '../Services/Friends/friendsService.js'; // Assurez-vous que le chemin est correct

document.addEventListener('DOMContentLoaded', () => {
    const addButton = document.querySelector('.addFriend');
    addButton.addEventListener('click', () => {
        const friendName = document.getElementById('friendName').value;
        const token = localStorage.getItem('token'); // Assurez-vous que le token est stocké correctement
        if (friendName && token) {
            console.log('Adding friend:', friendName);

            friendsService.addFriend(token, friendName)
                .then(response => {
                    friendsService.sendNotificationToUser(friendName, token, "friendRequest");

                    if (response.error) {
                        alert(`Error: ${response.error}`);
                    } else {
                        alert('Friend added successfully');
                    }
                });
        } else {
            alert('Please enter a friend name and make sure you are logged in.');
        }
    });
});
