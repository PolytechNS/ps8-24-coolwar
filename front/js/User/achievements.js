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
            const nameUser = document.querySelector("#nameUser");
            if (nameUser) {
                nameUser.textContent = userInfo.username; // Assuming username is a string like 'Username'
            } else {
                console.error("Element with ID 'nameUser' not found.");
            }
        });

        // Nouveau: récupérer tous les achievements et les mettre à jour
        userService.getAllAchievements((achievements) => {
            updateAchievements(achievements);
        });
    } else {
        console.error("No token found. Please log in.");
    }
});

function addSoundCloudPlayer() {
    const playerHtml = `<iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1788018703%3Fsecret_token%3Ds-uqqvuwf8xj5&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe><div style="font-size: 10px; color: #cccccc;line-break: anywhere;word-break: normal;overflow: hidden;white-space: nowrap;text-overflow: ellipsis; font-family: Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif;font-weight: 100;"><a href="https://soundcloud.com/leomendesmusic" title="leomendesmusic" target="_blank" style="color: #cccccc; text-decoration: none;">leomendesmusic</a> · <a href="https://soundcloud.com/leomendesmusic/drip-man-tu-fais-le-fou-vella-ps8/s-uqqvuwf8xj5" title="Drip Man - Tu fais le fou (Vella PS8)" target="_blank" style="color: #cccccc; text-decoration: none;">Drip Man - Tu fais le fou (Vella PS8)</a></div>`;
    const soundCloudContainer = document.createElement('div');
    soundCloudContainer.innerHTML = playerHtml;
    document.body.appendChild(soundCloudContainer);
}

function showAchievementDetails(achievement) {
    // Supprime une pop-up existante si elle est déjà ouverte
    const existingPopup = document.querySelector('.popup-container');
    if (existingPopup) {
        document.body.removeChild(existingPopup);
    }

    // Créer le conteneur de la pop-up
    const popupContainer = document.createElement('div');
    popupContainer.classList.add('popup-container');

    // Ajouter un fond semi-transparent
    const overlay = document.createElement('div');
    overlay.classList.add('popup-overlay');
    overlay.addEventListener('click', () => document.body.removeChild(popupContainer));

    // Construire le contenu de la pop-up
    const popupContent = document.createElement('div');
    popupContent.classList.add('popup-content');

    const image = document.createElement('img');
    image.src = '../../../../assets/' + achievement.imagePath;
    image.alt = achievement.name;
    image.classList.add('popup-image');

    const title = document.createElement('h3');
    title.textContent = achievement.name;
    title.classList.add('popup-title');

    const description = document.createElement('p');
    description.textContent = achievement.description;
    description.classList.add('popup-description');

    // Assembler la pop-up
    popupContent.appendChild(image);
    popupContent.appendChild(title);
    popupContent.appendChild(description);

    popupContainer.appendChild(overlay);
    popupContainer.appendChild(popupContent);

    document.body.appendChild(popupContainer);
}




function updateAchievements(achievements) {
    const achievementsContainer = document.querySelector(".listAchievements");
    achievementsContainer.innerHTML = ''; // Clear current achievements

    achievements.forEach(achievement => {
        const achievementElement = document.createElement('div');
        achievementElement.className = 'achievement';
        // Griser l'achievement s'il n'est pas visible
        if (!achievement.isVisible) {
            achievementElement.style.opacity = '0.5';
        }

        const achievementImg = document.createElement('img');
        // Utilisez achievement.imagePath pour le chemin de l'image
        achievementImg.src = '../../../../assets/' + achievement.imagePath;
        achievementImg.className = 'achievementImg';

        const lineDiv = document.createElement('div');
        lineDiv.className = 'line';

        const achievementName = document.createElement('p');
        achievementName.className = 'achievementName';
        // Utilisez achievement.name pour le nom de l'achievement
        achievementName.textContent = achievement.name;

        achievementElement.appendChild(achievementImg);
        achievementElement.appendChild(lineDiv);
        achievementElement.appendChild(achievementName);

        achievementsContainer.appendChild(achievementElement);

        achievementElement.addEventListener('click', () => showAchievementDetails(achievement));
        achievementsContainer.appendChild(achievementElement);

        // Exemple de gestion d'événement spécifique
        if (achievement._id === 'tu_fais_le_fou.jpg' && achievement.isVisible) {
            achievementImg.addEventListener('click', addSoundCloudPlayer);
        }
    });
}
