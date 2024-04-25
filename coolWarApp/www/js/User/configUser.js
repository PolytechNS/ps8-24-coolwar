import { userService } from "../Services/User/userService.js";

document.addEventListener('DOMContentLoaded', function() {
    const watchSwitch = document.querySelector('.settings .switch input[type="checkbox"]');

    watchSwitch.checked = false;

    userService.getUserInfo((userInfo) => {
        console.log('User info in config:', userInfo);
        console.log('User info watch in config:', userInfo.watch);
        if(userInfo.watch){
            watchSwitch.checked = true;
        }
    });


    watchSwitch.addEventListener('change', function() {
        // Récupérer le token du localStorage
        const token = localStorage.getItem('token');
        // Récupérer l'état du switch (true si coché, false sinon)
        const watch = watchSwitch.checked;

        // Appeler la méthode activateWatchAd avec le token et l'état du switch
        userService.activateWatchAd(token, watch).then(response => {
            console.log('Watch status updated:', response);
            // Vous pouvez ici mettre à jour l'interface utilisateur en fonction de la réponse
        }).catch(error => {
            console.error('Error updating watch status:', error);
        });
    });
});
