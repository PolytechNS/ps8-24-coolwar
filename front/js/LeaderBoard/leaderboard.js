import { userService } from '../Services/User/userService.js'; // Assurez-vous que le chemin est correct

document.addEventListener('DOMContentLoaded', () => {

    userService.listUsersLeaderboard(localStorage.getItem('token')).then((response) => {
        console.log("leaderboard : ", response);
        populateLeaderboard(response.users);
    });
});

function populateLeaderboard(users) {
    const listLeaderboard = document.querySelector('.listLeaderboard');

    // Vider la liste actuelle
    listLeaderboard.innerHTML = '';

    // Parcourir chaque utilisateur et les ajouter à la liste
    users.forEach((user, index) => {
        const userElement = document.createElement('div');
        userElement.classList.add('leaderboardFriend');

        // Modifier le chemin des assets si nécessaire
        const profilePicturePath = `../../../assets/profilePicture/${user.profilePicture}.png`;

        userElement.innerHTML = `
            <div class="leftSide">
                <p>${index + 1}.</p>
                <img class="profilePic" src="${profilePicturePath}">
                <p>${user.username}</p>
            </div>
            <div class="rightSide">
                <p>${user.trophies} Trophées</p>
                <img class="levelPic" src="../../../assets/level${user.lvl}.png">
            </div>
        `;

        listLeaderboard.appendChild(userElement);
    });
}