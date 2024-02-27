document.addEventListener("DOMContentLoaded", function() {
    // Get the elements
    const joinButton = document.querySelector('.joinGame');
    const join = document.querySelector('.join');
    const joining = document.querySelector('.joining');
    const searchGame = document.querySelector('.searchGame');
    const loading = document.querySelector('.loading');

    joining.style.display = 'none';
    loading.style.display = 'none';
    // Add click event listener to the ready button
    joinButton.addEventListener('click', function() {
        // Toggle visibility of playerReady and playerWaiting images
        joining.style.display = 'block';
        loading.style.display = 'block';
        join.style.display = 'none';
        searchGame.style.display = 'none';
        joinButton.style.display = 'none';
    });
});
