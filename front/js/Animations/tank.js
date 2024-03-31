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
            const bulletSpeed = 5;
            const deltaX = Math.cos(angle) * bulletSpeed;
            const deltaY = Math.sin(angle) * bulletSpeed;

            bullet.style.left = (bulletX + deltaX) + 'px';
            bullet.style.top = (bulletY + deltaY) + 'px';

            const buttons = document.querySelectorAll('.theButton'); // Sélectionner tous les boutons avec la classe "theButton"

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
        const bulletSize = 5; // Taille de la balle principale
        const fragmentSize = 2; // Taille des fragments

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

            const fragmentMove = setInterval(function() {
                const fragmentX = parseFloat(fragment.style.left);
                const fragmentY = parseFloat(fragment.style.top);

                fragment.style.left = (fragmentX + deltaX) + 'px';
                fragment.style.top = (fragmentY + deltaY) + 'px';

                if (fragmentX < 0 || fragmentX > window.innerWidth || fragmentY < 0 || fragmentY > window.innerHeight) {
                    clearInterval(fragmentMove);
                    document.body.removeChild(fragment);
                }
            }, 10);
        }

        document.body.removeChild(bullet);
    }
});

