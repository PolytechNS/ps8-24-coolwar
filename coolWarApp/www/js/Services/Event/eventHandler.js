import {socketManager} from "../../Socket/socketManager.js";


document.addEventListener('DOMContentLoaded', () => {



    socketManager.socket.on('event alert', (data) => {
        const eventAlertSpan = document.querySelector('.alert');
        const wootDance = document.querySelector('.woot-dance');
        const ghostCanvas = document.querySelector('#ghost');


        console.log('event alert', data);

        // Immediately show the alert element when the event is received
        eventAlertSpan.style.display = 'block';

        if(data.type==='halloween'){
            setTimeout(() => {
                if (eventAlertSpan) {
                    console.log('alert', eventAlertSpan);
                    eventAlertSpan.textContent = "Achievement débloqué";
                    ghostCanvas.style.display = 'block';
                    wootDance.style.display = 'none';

                    // Set another timeout to hide the alert after 5 seconds
                    setTimeout(() => {
                        eventAlertSpan.style.display = 'none';
                    }, 5000);

                } else {
                    console.log('Element .alert not found in the DOM.');
                }
            }, 3000); // 3000 milliseconds equals 3 seconds
        }
        else if(data.type==='dancer'){
            console.log('dancer tu fais le fou');
            wootDance.style.display = 'block';
            ghostCanvas.style.display = 'none';
        }

    });






});
