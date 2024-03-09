const {setup, updateBoard, nextMove} = require('./CoolWar.js');
async function executeSequentially() {
    console.log('Exécution séquentielle des méthodes.');
    let opponentWalls =[
        ["75",0]
    ];
    let ownWalls = [
        ["37",1],
        ["78",1],
        [ "26", 0 ],
        [ "38", 0 ],
        [ "17", 0 ]
    ];
    let board = [
        [0,0,0,0,0,1,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0]
    ];

    // Attend que setup soit terminé
    const setupResponse = await setup(9);
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
