import {socketManager} from "../../Socket/socketManager.js";


document.addEventListener('DOMContentLoaded', () => {


    socketManager.socket.on('event alert', (data) => {
        const eventAlertSpan = document.querySelector('.alert');

        // Immediately show the alert element when the event is received
        eventAlertSpan.style.display = 'block';

        // After 3 seconds, update the text content of the alert
        setTimeout(() => {
            if (eventAlertSpan) {
                console.log('alert', eventAlertSpan);
                eventAlertSpan.textContent = "Achievement débloqué";

                // Set another timeout to hide the alert after 5 seconds
                setTimeout(() => {
                    eventAlertSpan.style.display = 'none';
                }, 5000);

            } else {
                console.log('Element .alert not found in the DOM.');
            }
        }, 3000); // 3000 milliseconds equals 3 seconds
    });






});
