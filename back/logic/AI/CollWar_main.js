//const {setup, updateBoard, nextMove} = require('../../../../../kickoridor24.js');
const {setup, updateBoard, nextMove} = require('./CoolWar.js');
async function executeSequentially() {
    console.log('Exécution séquentielle des méthodes.');
    let opponentWalls =[

    ];
    let ownWalls = [
        [ '78', 1 ],
        [ '57', 1 ]
    ];
    let board = [
        //1 tableau = une colonne
        [0,0,0,0,0,0,0,0,0],
        [1,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,2,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0]
    ];

    // Attend que setup soit terminé
    const setupResponse = await setup(1);
    console.log("SETUP RESPONSE :",setupResponse);

    // Attend que updateBoard soit terminé
    const updateBoardResponse = await updateBoard({board, ownWalls, opponentWalls});
    console.log(updateBoardResponse);

    // Attend que nextMove soit terminé
    const nextMoveResponse = await nextMove({board, ownWalls, opponentWalls});
    console.log(nextMoveResponse);
}

// Appel de la fonction asynchrone
executeSequentially().then(() => {
    console.log('Toutes les méthodes ont été exécutées séquentiellement.');
}).catch((error) => {
    console.error('Une erreur est survenue lors de l’exécution séquentielle des méthodes:', error);
});
