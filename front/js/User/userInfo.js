import {socketManager} from "../Socket/socketManager.js";
import {userService} from "../Services/User/userService.js";


document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('token');
    if (!socketManager.isSocketInitialized(token)) {
        socketManager.initializeSocket(token);
    }
    if (token) {
        userService.getUserInfo((userInfo) => {
            // Mettre à jour le nom d'utilisateur
            const usernameElement = document.querySelector('.nameAndLogout .username');
            if (usernameElement) {
                usernameElement.textContent = userInfo.username;
            }

            const profilePictureElement = document.querySelector('.user .profilePicture');
            if (profilePictureElement) {
                // Supposons que userInfo.profilePicture contient le chemin d'accès relatif à l'image de profil
                profilePictureElement.src = `../../../../assets/profilePicture/${userInfo.profilePicture}.png`;
            }

            // Mettre à jour le niveau actuel et le niveau suivant
            const currentLevelElement = document.querySelector('.level-progress-info .level-range .current-level');
            const nextLevelElement = document.querySelector('.level-progress-info .level-range .next-level');
            const levelElement = document.querySelector('.level-circle .level-number');

            // Mettre à jour les éléments avec les informations de l'utilisateur
            if (currentLevelElement && nextLevelElement && levelElement) {
                currentLevelElement.textContent = userInfo.lvl; // Niveau actuel
                nextLevelElement.textContent = userInfo.lvl + 1; // Niveau suivant
                levelElement.textContent = userInfo.lvl; // Niveau actuel
            }

            // Mettre à jour l'expérience et la barre de progression
            const currentExpElement = document.querySelector('.level-progress-info .level-points .current-exp');
            const nextLevelExpElement = document.querySelector('.level-progress-info .level-points .next-level-exp');
            const progressBarFill = document.querySelector('.progress-bar .progress-bar-fill');

            const expBase = 100;
            const expFactor = 1.5;
            const nextLvlExp = Math.round(Math.pow(expFactor, userInfo.lvl) * expBase); // Expérience nécessaire pour le prochain niveau, arrondie

            if (currentExpElement && nextLevelExpElement) {
                currentExpElement.textContent = userInfo.exp; // Expérience actuelle
                nextLevelExpElement.textContent = nextLvlExp; // Expérience nécessaire pour le niveau suivant
            }
            if (progressBarFill) {
                // Calcule la largeur de la barre de progression en fonction de l'expérience actuelle
                const expForCurrentLevel = Math.pow(expFactor, userInfo.lvl - 1) * expBase; // Expérience au début du niveau actuel
                const percentage = ((userInfo.exp - expForCurrentLevel) / (nextLvlExp - expForCurrentLevel)) * 100;
                const calculatedWidth = ((userInfo.exp - expForCurrentLevel) / (nextLvlExp - expForCurrentLevel)) * 100;
                progressBarFill.style.width = `${Math.max(calculatedWidth, 1)}%`; // Assure au moins 1% pour visibilité


                console.log(`Current Exp: ${userInfo.exp}, Exp for current level: ${expForCurrentLevel}, Next level Exp: ${nextLvlExp}, Width: ${percentage}%`); // Pour le débogage
            }
        });
    } else {
        console.error("No token found. Please log in.");
    }
});