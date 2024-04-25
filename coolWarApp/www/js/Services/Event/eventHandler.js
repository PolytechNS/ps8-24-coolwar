import {socketManager} from "../../Socket/socketManager.js";


document.addEventListener('DOMContentLoaded', () => {
    socketManager.socket.on('event alert', (data) => {
        const eventAlertSpan = document.querySelector('.alert');
        const wootDance = document.querySelector('.woot-dance');
        const ghostCanvas = document.querySelector('#ghost');
        const tank = document.querySelector('.tank');

        console.log('event alert', data);

        // Immediately show the alert element when the event is received
        eventAlertSpan.style.display = 'block';

        if(data.type==='halloween'){
            setTimeout(() => {
                if (eventAlertSpan) {
                    console.log('alert', eventAlertSpan);
                    eventAlertSpan.textContent = "Achievement débloqué";
                    ghostCanvas.style.display = 'block';
                    document.body.insertAdjacentHTML('afterbegin', `
                    <div class="container ">
                        <!-- Background -->
                        <div class="moon"></div>
                        <div class="clouds cloud1">
                            <div></div>
                            <div></div>
                        </div>
                        <div class="clouds cloud2">
                            <div></div>
                            <div></div>
                        </div>
                        <div class="clouds cloud3">
                            <div></div>
                            <div></div>
                        </div>
                        <div class="clouds cloud4">
                            <div></div>
                            <div></div>
                        </div>
                        <div class="clouds cloud5">
                            <div></div>
                            <div></div>
                        </div>
                    
                        <div class="smoke">
                            <div></div>
                        </div>
                    
                        <!-- Lantern Garland -->
                        <div class="dancing-line">
                    
                            <div class="pumpkin">
                                <div class="stem"></div>
                                <div class="heart"></div>
                                <div class="rounded-eyes"></div>
                                <div class="rounded-eyes"></div>
                                <div class="mean-mouth"></div>
                            </div>
                    
                            <div class="pumpkin">
                                <div class="stem"></div>
                                <div class="heart"></div>
                                <div class="eye"></div>
                                <div class="eye eye-right"></div>
                                <div class="bb-mouth"></div>
                            </div>
                    
                            <div class="pumpkin">
                                <div class="stem"></div>
                                <div class="heart"></div>
                                <div class="rounded-eyes baby-eyes"></div>
                                <div class="rounded-eyes baby-eyes"></div>
                                <div class="mean-mouth"></div>
                            </div>
                    
                            <div class="pumpkin">
                                <div class="stem"></div>
                                <div class="heart"></div>
                                <div class="rounded-eyes"></div>
                                <div class="rounded-eyes"></div>
                                <div class="rounded-mouth"></div>
                            </div>
                    
                            <div class="pumpkin">
                                <div class="stem"></div>
                                <div class="heart"></div>
                                <div class="eye"></div>
                                <div class="eye eye-right"></div>
                                <div class="bb-mouth"></div>
                            </div>
                    
                            <div class="pumpkin">
                                <div class="stem"></div>
                                <div class="heart"></div>
                                <div class="rounded-eyes"></div>
                                <div class="rounded-eyes"></div>
                                <div class="mean-mouth"></div>
                            </div>
                    
                            <div class="pumpkin">
                                <div class="stem"></div>
                                <div class="heart"></div>
                                <div class="eye"></div>
                                <div class="eye eye-right"></div>
                                <div class="bb-mouth"></div>
                            </div>
                    
                            <div class="pumpkin">
                                <div class="stem"></div>
                                <div class="heart"></div>
                                <div class="rounded-eyes baby-eyes"></div>
                                <div class="rounded-eyes baby-eyes"></div>
                                <div class="mean-mouth"></div>
                            </div>
                    
                        </div>
                    </div>`);

                    let body = document.querySelector('body');
                    body.style.background='radial-gradient(ellipse at center, #160909 0%, #05060f 45%, #0d0b30 100%)';

                    wootDance.style.display = 'none';
                    tank.style.display = 'none';
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
