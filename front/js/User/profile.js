import { socketManager } from "../Socket/socketManager.js";
import { userService } from "../Services/User/userService.js";

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('token');
    if (!socketManager.isSocketInitialized(token)) {
        socketManager.initializeSocket(token);
    }
    if (token) {
        userService.getUserInfo((userInfo) => {
            console.log("PROFILE USER info", userInfo);
            updateProfilePage(userInfo);
        });
    } else {
        console.error("No token found. Please log in.");
    }
});

function updateProfilePage(userInfo) {
    // Mise à jour du nom d'utilisateur et de l'image de profil
    console.log("PROFILE USER info", userInfo);
    document.getElementById('username').textContent = userInfo.username;
    // Ajustez le chemin de l'image de profil selon votre structure de projet
    document.querySelector('.profilePicture').src = `../../../assets/profilePicture/${userInfo.profilePicture}.png`;
    document.querySelector('.userPic').src = `../../../assets/profilePicture/${userInfo.profilePicture}.png`;

    // Mise à jour des statistiques de l'utilisateur
    // Supposons que vous avez un moyen de calculer le ratio victoires/défaites et le meilleur temps
    const winLossRatio = userInfo.wins > 0 ? (userInfo.wins / (userInfo.wins + userInfo.losses)).toFixed(2) : 0;
    document.querySelector('.userStats').innerHTML = `
        <p>Games won: ${userInfo.wins}</p>
        <p>Win/lose ratio: ${winLossRatio}</p>
        <p>Level: ${userInfo.lvl}</p>
    `;

    // Mise à jour des informations de niveau
    // Remarque : vous devez définir comment calculer l'expérience actuelle et celle nécessaire pour le niveau suivant
    const currentExp = userInfo.exp; // Expérience actuelle
    const nextLevelExp = calculateNextLevelExp(userInfo.lvl); // Calculer l'expérience nécessaire pour le niveau suivant
    const expProgress = (currentExp / nextLevelExp * 100).toFixed(2); // Pourcentage de progression
    document.getElementById('level-number').textContent = userInfo.lvl;
    document.getElementById('current-level').textContent = userInfo.lvl;
    document.getElementById('next-level').textContent = userInfo.lvl + 1;
    document.getElementById('current-exp').textContent = currentExp;
    document.getElementById('next-level-exp').textContent = nextLevelExp;
    document.getElementById('progress-bar-fill').style.width = `${expProgress}%`;
}

function calculateNextLevelExp(level) {
    const expBase = 100; // Expérience nécessaire pour le premier niveau
    const expFactor = 1.5; // Facteur d'augmentation de l'expérience nécessaire pour chaque niveau supplémentaire

    if (level === 0) {
        return expBase; // Retourne directement l'expérience nécessaire pour atteindre le premier niveau
    }

    // Calcul de l'expérience totale nécessaire pour atteindre le niveau actuel à partir de zéro
    let totalExpForCurrentLevel = expBase * (Math.pow(expFactor, level - 1));

    // Calcul de l'expérience totale nécessaire pour atteindre le prochain niveau à partir de zéro
    let totalExpForNextLevel = expBase * (Math.pow(expFactor, level));

    // L'expérience nécessaire pour le prochain niveau est la différence entre l'expérience totale pour le prochain niveau
    // et l'expérience totale pour le niveau actuel
    return Math.round(totalExpForNextLevel - totalExpForCurrentLevel);
}
