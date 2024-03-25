import {socketManager} from "../Socket/socketManager.js";
import {userService} from "../Services/User/userService.js";


document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('token');
    if (!socketManager.isSocketInitialized(token)) {
        socketManager.initializeSocket(token);
    }
    if (token) {
        userService.getUserInfo((userInfo) => {
            console.log("User info", userInfo);
            // Mettre à jour le nom d'utilisateur
            const usernameElement = document.querySelector('.nameAndLogout .username');
            if (usernameElement) {
                usernameElement.textContent = userInfo.username;
            }

            // Mettre à jour le niveau et la progression de l'expérience
            // Ici, vous devrez ajuster les sélecteurs en fonction de votre structure HTML
            const levelElement = document.querySelector('.level'); // Remplacer '.level' par le sélecteur correct pour votre numéro de niveau
            const expProgressElement = document.querySelector('.expProgress'); // Remplacer '.expProgress' par le sélecteur correct pour votre barre de progression
            // Mettre à jour le DOM avec les informations de l'utilisateur
            document.querySelector('.nameAndLogout .username').textContent = userInfo.username; // Mettre à jour le nom d'utilisateur
            document.querySelector('.levelDisplay .userLevel').textContent = userInfo.lvl; // Mettre à jour le niveau


            if (levelElement) {
                levelElement.textContent = userInfo.lvl; // Mettre à jour avec le niveau de l'utilisateur
            }
            if (expProgressElement) {
                // Mettre à jour avec la progression de l'expérience de l'utilisateur
                // Cela dépend de la manière dont votre barre de progression est implémentée.
                // Par exemple, si c'est une largeur de style CSS, cela pourrait ressembler à :
                // expProgressElement.style.width = `${(userInfo.exp / maxExp) * 100}%`;
                // où maxExp est l'expérience nécessaire pour atteindre le prochain niveau
            }
        });
    } else {
        console.error("No token found. Please log in.");
    }
});
