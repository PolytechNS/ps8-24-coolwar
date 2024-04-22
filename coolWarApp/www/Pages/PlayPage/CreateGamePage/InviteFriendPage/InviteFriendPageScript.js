document.addEventListener("DOMContentLoaded", function() {
    // Get the elements
    const inviteButton = document.querySelector('.invite');
    const sent = document.querySelector('.sent');

    sent.style.display = 'none';
    // Add click event listener to the ready button
    inviteButton.addEventListener('click', function() {
        // Toggle visibility of playerReady and playerWaiting images
        sent.style.display = 'block';
    });
});
