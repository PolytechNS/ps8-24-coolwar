document.addEventListener("DOMContentLoaded", function() {
    const tank = document.getElementById('tank');
    let bulletId = 0;

    document.addEventListener('mousemove', function(event) {
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        const tankX = tank.offsetLeft + tank.offsetWidth / 2;
        const tankY = tank.offsetTop + tank.offsetHeight / 2;

        const angle = Math.atan2(mouseY - tankY, mouseX - tankX);
        const angleDeg = angle * (180 / Math.PI);

        tank.style.transform = `translate(-50%, -50%) rotate(${angleDeg}deg)`;
    });

    document.addEventListener('click', function(event) {
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        const tankX = tank.offsetLeft + tank.offsetWidth / 2;
        const tankY = tank.offsetTop + tank.offsetHeight / 2;

        const angle = Math.atan2(mouseY - tankY, mouseX - tankX);
        const angleDeg = angle * (180 / Math.PI);

        const bullet = document.createElement('div');
        bullet.className = 'bullet';
        bullet.id = 'bullet_' + bulletId++;
        bullet.style.left = (tankX-80) + 'px';
        bullet.style.top = (tankY) + 'px';
        document.body.appendChild(bullet);

        const bulletMove = setInterval(function() {
            const bulletX = parseFloat(bullet.style.left);
            const bulletY = parseFloat(bullet.style.top);
            const bulletSpeed = 15;
            const deltaX = Math.cos(angle) * bulletSpeed;
            const deltaY = Math.sin(angle) * bulletSpeed;

            bullet.style.left = (bulletX + deltaX) + 'px';
            bullet.style.top = (bulletY + deltaY) + 'px';

            const buttons = document.querySelectorAll('.explose'); // Sélectionner tous les boutons avec la classe "theButton"

            buttons.forEach(button => {
                const buttonRect = button.getBoundingClientRect();
                if (
                    bulletX > buttonRect.left &&
                    bulletX < buttonRect.right &&
                    bulletY > buttonRect.top &&
                    bulletY < buttonRect.bottom
                ) {
                    // Collision détectée, faites exploser le bouton ou faites ce que vous voulez
                    explodeBullet(bullet);
                    clearInterval(bulletMove);
                }
            });

            if (bulletX < 0 || bulletX > window.innerWidth || bulletY < 0 || bulletY > window.innerHeight) {
                clearInterval(bulletMove);
                document.body.removeChild(bullet);
            }
        }, 10);
    });

    function explodeBullet(bullet) {
        const numFragments = 10; // Nombre de fragments de balle
        const fragmentSize = 2; // Taille des fragments
        const maxMoves = 100; // Nombre maximal de déplacements pour chaque fragment

        for (let i = 0; i < numFragments; i++) {
            const fragment = document.createElement('div');
            fragment.className = 'fragment';
            fragment.style.width = fragmentSize + 'px';
            fragment.style.height = fragmentSize + 'px';
            fragment.style.backgroundColor = 'white';
            fragment.style.position = 'absolute';
            fragment.style.left = parseFloat(bullet.style.left) + 'px';
            fragment.style.top = parseFloat(bullet.style.top) + 'px';

            const angle = Math.random() * Math.PI * 2; // Angle aléatoire pour chaque fragment
            const speed = Math.random() * 3 + 2; // Vitesse aléatoire pour chaque fragment

            const deltaX = Math.cos(angle) * speed;
            const deltaY = Math.sin(angle) * speed;

            document.body.appendChild(fragment);

            let moveCount = 0; // Compteur pour le nombre de déplacements
            const fragmentMove = setInterval(function() {
                if (++moveCount > maxMoves) {
                    clearInterval(fragmentMove);
                    document.body.removeChild(fragment);
                    return;
                }

                const fragmentX = parseFloat(fragment.style.left);
                const fragmentY = parseFloat(fragment.style.top);
                const nextX = fragmentX + deltaX;
                const nextY = fragmentY + deltaY;

                // Vérification pour s'assurer que le fragment reste dans les limites du navigateur
                if (nextX < 0 || nextX > window.innerWidth || nextY < 0 || nextY > window.innerHeight) {
                    clearInterval(fragmentMove);
                    document.body.removeChild(fragment);
                } else {
                    fragment.style.left = nextX + 'px';
                    fragment.style.top = nextY + 'px';
                }
            }, 10);
        }

        document.body.removeChild(bullet);
    }

});

