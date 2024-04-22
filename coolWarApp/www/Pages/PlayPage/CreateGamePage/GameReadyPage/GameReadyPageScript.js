document.addEventListener("DOMContentLoaded", function() {
    // Get the elements
    const readyButton = document.querySelector('.ready');
    const playerReady = document.querySelector('.playerReady');
    const playerWaiting = document.querySelector('.playerWaiting');

    playerReady.style.display = 'none';
    // Add click event listener to the ready button
    readyButton.addEventListener('click', function() {
        // Toggle visibility of playerReady and playerWaiting images
        playerReady.style.display = 'block';
        playerWaiting.style.display = 'none';
    });
});
