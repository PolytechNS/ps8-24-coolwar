import { userService } from '../Services/User/UserService.js';

document.addEventListener('DOMContentLoaded', function() {
    const watchSwitch = document.querySelector('.settings .switch input[type="checkbox"]');

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
