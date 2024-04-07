import { socketManager } from "../Socket/socketManager.js";
import { userService } from "../Services/User/userService.js";

// Mise à jour de l'interface utilisateur avec les informations de l'utilisateur
function updateUserInfo(userInfo) {
    // Mise à jour du nom d'utilisateur
    const usernameElement = document.querySelector('.nameAndLogout .username');
    if (usernameElement) {
        usernameElement.textContent = userInfo.username;
    }

    // Mise à jour de l'image de profil
    const profilePictureElement = document.querySelector('.user .profilePicture');
    if (profilePictureElement) {
        profilePictureElement.src = `../../../../assets/profilePicture/${userInfo.profilePicture}.png`;
    }

    // Mise à jour du niveau actuel, du niveau suivant, et de l'expérience
    const currentLevelElement = document.querySelector('.level-progress-info .level-range .current-level');
    const nextLevelElement = document.querySelector('.level-progress-info .level-range .next-level');
    const levelElement = document.querySelector('.level-circle .level-number');
    const currentExpElement = document.querySelector('.level-progress-info .level-points .current-exp');
    const nextLevelExpElement = document.querySelector('.level-progress-info .level-points .next-level-exp');
    const progressBarFill = document.querySelector('.progress-bar .progress-bar-fill');

    if (currentLevelElement && nextLevelElement && levelElement) {
        currentLevelElement.textContent = userInfo.lvl;
        nextLevelElement.textContent = userInfo.lvl + 1;
        levelElement.textContent = userInfo.lvl;
    }

    const expBase = 100;
    const expFactor = 1.5;
    const nextLvlExp = Math.round(Math.pow(expFactor, userInfo.lvl) * expBase);

    if (currentExpElement && nextLevelExpElement && progressBarFill) {
        currentExpElement.textContent = userInfo.exp;
        nextLevelExpElement.textContent = nextLvlExp;

        const expForCurrentLevel = Math.pow(expFactor, userInfo.lvl - 1) * expBase;
        const percentage = ((userInfo.exp - expForCurrentLevel) / (nextLvlExp - expForCurrentLevel)) * 100;
        progressBarFill.style.width = `${Math.max(percentage, 1)}%`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('token');
    if (!socketManager.isSocketInitialized(token)) {
        socketManager.initializeSocket(token);
    }
    if (token) {
        let userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            userInfo = JSON.parse(userInfo);
            // Vérifiez si les données nécessitent une mise à jour ici, si nécessaire
            updateUserInfo(userInfo);
        } else {
            userService.getUserInfo(userInfo => {
                localStorage.setItem('userInfo', JSON.stringify(userInfo)); // Stockage des informations de l'utilisateur
                updateUserInfo(userInfo); // Mise à jour de l'interface utilisateur
            })};
    } else {
        console.error("No token found. Please log in.");
    }
});
