import {socketManager} from "../Socket/socketManager.js";
import {userService} from "../Services/User/userService.js";





document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('token');
    if (token) {
        userService.getUserSkin(token).then(data => {
            const { userSkins, allSkins } = data;
            const listOfSkinElement = document.querySelector('.listOfSkin');
            listOfSkinElement.innerHTML = ''; // Nettoyer la liste avant de rajouter les skins

            allSkins.forEach(skin => {
                const skinElement = createSkinElement(skin, userSkins);
                listOfSkinElement.appendChild(skinElement);
            });
        }).catch(error => console.error('Failed to load skins:', error));
    }
});

function createSkinElement(skinName, userSkins) {
    const skinElement = document.createElement('div');
    skinElement.className = 'skin';
    const imgSkin = document.createElement('img');
    imgSkin.className = 'imgSkin';
    imgSkin.src = `../../../../assets/skin/${skinName}.png`;
    imgSkin.alt = `${skinName}`;

    // Assombrir l'image si le skin n'est pas possédé par l'utilisateur
    if (!userSkins.owned.includes(skinName)) {
        imgSkin.style.opacity = '0.5';
    }

    const line = document.createElement('div');
    line.className = 'line';

    const skinNameParagraph = document.createElement('p');
    skinNameParagraph.textContent = skinName;

    skinElement.appendChild(imgSkin);
    skinElement.appendChild(line);
    skinElement.appendChild(skinNameParagraph);

    return skinElement;
}