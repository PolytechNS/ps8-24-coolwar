const {ObjectId, MongoClient} = require("mongodb");
const {playBot, nextMoveBotController} = require("./botController");
const {MONGO_URL} = require("../Utils/constants");
const client = new MongoClient(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

async function createGameDb(gameId,playersInfo,gameModelGlobal) {
    await client.connect();
    const db = client.db();
    const gameBoard = await db.collection('gameboards').insertOne({
        gameId: gameId, // Lier le plateau de jeu à la partie
        nbJoueursMax: gameModelGlobal.nbPlayers, // Nombre maximum de joueurs
        roundCounter: gameModelGlobal.roundCounter, // Compteur de tours
        currentPlayer: gameModelGlobal.currentPlayer, // Joueur actuel
        winner : gameModelGlobal.winner,
        lastChance: gameModelGlobal.lastChance,
        typeGame: gameModelGlobal.typeGame
        // autres données du plateau de jeu
    });
    const gameBoardId = gameBoard.insertedId;
    console.log("gameBoardId",gameBoardId);
    //retrieveGameBoardId
    let gameBoardIdDb = await db.collection('gameboards').findOne({ gameId: gameId });
    console.log("gameBoardIdDb",gameBoardIdDb);

    // Supposons que 'playersInfo' contient des informations des deux joueurs récupérées de la base de données.
    const gamePlayers = gameModelGlobal.player_array.getAllPlayers(); // Contient les objets de jeu pour Player1 et Player2
// Aucune association par nom n'est nécessaire car vous définissez arbitrairement les rôles basés sur l'ordre.
    await db.collection('character').insertMany(gamePlayers.map((gamePlayer, index) => {
        return {
            ...gamePlayer, // propriétés du modèle de jeu (position, nombre de murs, etc.)
            userId: playersInfo[index]._id, // Assigne l'ID de l'utilisateur du tableau playersInfo basé sur l'ordre
            gameBoardId: gameBoardId, // L'ID du plateau de jeu
            currentPlayerIndex: index + 1 // 1 pour le premier joueur, 2 pour le second
        };
    }));

    // Persister les murs et les cases en référençant l'ID du plateau de jeu

    const horizontalWalls = gameModelGlobal.horizontal_Walls.getAllWalls();
    await db.collection('walls').insertMany(horizontalWalls.map(wall => ({
        ...wall,
        gameBoardId: gameBoardId,
        idPlayer: null,
        type: 'H' // Ajout d'une propriété pour indiquer l'orientation du mur
    })));

    const verticalWalls = gameModelGlobal.vertical_Walls.getAllWalls();
    await db.collection('walls').insertMany(verticalWalls.map(wall => ({
        ...wall,
        gameBoardId: gameBoardId,
        type: 'V' // Ajout d'une propriété pour indiquer l'orientation du mur
    })));

    const squares = gameModelGlobal.playable_squares;
    const squaresList = [...squares.getAllPlayableSquares()];
    await db.collection('squares').insertMany(squaresList.map(square => ({
        ...square,
        gameBoardId: gameBoardId
    })));
    return gameBoardId;
}

async function retrieveCharacterFromDb(db,gameBoardId){
    return await db.collection('character').find({gameBoardId: new ObjectId(gameBoardId)}).toArray();
}



async function saveGame(userToken, db, data) {
    const userId = await db.collection('users').findOne({ token: userToken});
    const gameDb = await db.collection('games').findOne({ _id: new ObjectId(data.gameId), creator_id: userId.username});
    const gameBoardId = await db.collection('gameboards').findOne({ gameId: gameDb._id });

    // Sauvegarder l'état du jeu avec l'ID de l'utilisateur
    await db.collection('savedGames').insertOne({
        userId,
        gameId:gameDb._id, // Assurez-vous que gameState est un objet sérialisable
        gameBoardId: gameBoardId._id,
        createdAt: new Date()
    });
    return gameBoardId;
}

async function updateWinnerAndLooser(gameId,winner) {
    await client.connect();
    const db = client.db();
    let gameBoard = await db.collection('gameboards').findOne({ gameId: new ObjectId(gameId) });
    let players = await db.collection('character').find({gameBoardId: new ObjectId(gameBoard._id)}).toArray();
    //console.log("players",players);
    let player1 = players.find(player => player.currentPlayerIndex === 1);
    let player2 = players.find(player => player.currentPlayerIndex === 2);
    let play1Db = await db.collection('users').findOne({_id: new ObjectId(player1.userId)});
    let play2Db = await db.collection('users').findOne({_id: new ObjectId(player2.userId)});
    if(winner === 1){
        await db.collection('gameboards').updateOne({ _id: new ObjectId(gameBoard._id) }, { $set: { winner: play1Db._id, looser: play2Db._id } });

    }else{
        await db.collection('gameboards').updateOne({ _id: new ObjectId(gameBoard._id) }, { $set: { winner: play2Db._id, looser: play1Db._id } });
    }
}



async function updateWinnerAndLooserBot(gameId, winner) {
    await client.connect();
    const db = client.db();
    console.log("update winner and looser bot");
    let gameBoard = await db.collection('gameboards').findOne({ gameId: new ObjectId(gameId) });
    let players = await db.collection('character').find({gameBoardId: gameBoard._id}).toArray();
    let player1 = players.find(player => player.currentPlayerIndex === 1);
    let player2 = players.find(player => player.currentPlayerIndex === 2);
    let play1Db = await db.collection('users').findOne({_id: new ObjectId(player1.userId)});
    let play2Db = "bot";
    if(winner === 1){
        await db.collection('gameboards').updateOne({ _id: gameBoard._id }, { $set: { winner: play1Db._id, looser: play2Db} });
    }else{
        await db.collection('gameboards').updateOne({ _id: gameBoard._id }, { $set: { winner: play2Db, looser: play1Db._id } });
    }
}
async function loadGameFromDb(db, savedGame) {
    const gameBoardSaved = await db.collection('gameboards').findOne({ _id: savedGame.gameBoardId });
    //get all walls from gameBoardSaved
    const wallsHorizontal = await db.collection('walls').find({gameBoardId: gameBoardSaved._id, type: 'H'}).toArray();
    const wallsVertical = await db.collection('walls').find({gameBoardId: gameBoardSaved._id, type: 'V'}).toArray();
    const playableSquares = await db.collection('squares').find({gameBoardId: gameBoardSaved._id}).toArray();
    const players_array = await db.collection('character').find({gameBoardId: gameBoardSaved._id}).toArray();
    const config = {
        horizontal_Walls: wallsHorizontal,
        vertical_Walls: wallsVertical,
        playable_squares: playableSquares,
        player_array: players_array,
        currentPlayer: gameBoardSaved.currentPlayer,
        roundCounter: gameBoardSaved.roundCounter,
        winner : gameBoardSaved.winner,
        lastChance: gameBoardSaved.lastChance,
        typeGame: gameBoardSaved.typeGame
    };
    return config;
}

async function updatePositionCharacter(dataParse,db,gameModelGlobal){
    const gameIdDb = await db.collection('games').findOne({ _id: new ObjectId(dataParse.gameId) });
    const gameBoard = await db.collection('gameboards').findOne({ gameId: gameIdDb._id });
    const currentPlayer = gameBoard.currentPlayer;
    let playerCharacter = await db.collection('character').findOne({ gameBoardId: gameBoard._id, currentPlayerIndex: currentPlayer });

    //find square where is the player

    //on met à jour la position du joueur dans la bd
    for (let square of gameModelGlobal.playable_squares.getAllPlayableSquares()) {
        if(parseInt(square.position.row) === parseInt(playerCharacter.position.row) && parseInt(square.position.col) === parseInt(playerCharacter.position.col)){
            //update db
            await db.collection('character').updateOne({ _id: playerCharacter._id , gameBoardId: gameBoard._id}, { $set: { position: { row: dataParse.row, col: dataParse.col } } });
            let playerCharacterUpdated = await db.collection('character').findOne({ _id: new ObjectId(playerCharacter._id)});
            console.log('Player position updated', playerCharacterUpdated.position.row + " " + playerCharacterUpdated.position.col);
        }
    }
    return gameBoard;
}
async function manageBotMove(gameModelGlobal){
    return await nextMoveBotController(gameModelGlobal);
}


async function updatePlayerPositionFromDb(squareGameModel,db,gameBoard,gameModelGlobal){
    let botCharacter = await db.collection('character').findOne({ gameBoardId: new ObjectId(gameBoard._id), currentPlayerIndex: gameModelGlobal.currentPlayer });
    let botCharacterGameModel = gameModelGlobal.player_array.getPlayer(gameModelGlobal.currentPlayer);
    for(let square of squareGameModel){
        if(parseInt(square.position.row) === parseInt(botCharacter.position.row) && parseInt(square.position.col) === parseInt(botCharacter.position.col)){

            //update db
            await db.collection('character').updateOne({ _id: botCharacter._id , gameBoardId: gameBoard._id}, { $set: { position: { row: botCharacterGameModel.position.row, col: botCharacterGameModel.position.col } } });
            let botCharacterUpdated = await db.collection('character').findOne({ _id: new ObjectId(botCharacter._id)});
            console.log('Bot position updated', botCharacterUpdated.position.row + " " + botCharacterUpdated.position.col);
        }
    }
}

async function updateCurrentPlayerFromDb(gameBoard,db,gameModelGlobal){
    //on met à jour le joueur actuel dans la bd
    await db.collection('gameboards').updateOne({ _id: gameBoard._id }, { $set: { currentPlayer: gameModelGlobal.currentPlayer, lastChance: gameModelGlobal.lastChance, winner: gameModelGlobal.winner, roundCounter: gameModelGlobal.roundCounter } });
    const gameBoardUpdated = await db.collection('gameboards').findOne({ _id: gameBoard._id });
    console.log('Current player db  updated', gameBoardUpdated.currentPlayer);
}

function setUpPositionRealBot(positionBot,gameModelGlobal,botIndex){
    let col = parseInt(positionBot.charAt(0)) -1;
    let row = parseInt(positionBot.charAt(1)) -1;
    gameModelGlobal.updatePlayerPosition(botIndex+1, row, col);
    //update visibility
    gameModelGlobal.resetSquaresVisibility();
    gameModelGlobal.computeSquaresVisibility();
}
async function updateWallsAndVisibilityFromBd(wallDataDeserialized,playerBd,gameBoardIdDb,gameModelGlobal,db){
    let nbWalls = playerBd.nbWalls - 1;
    await db.collection('character').updateOne({ _id: new ObjectId(playerBd._id) }, { $set: { nbWalls : nbWalls } });
    for (let wallString of wallDataDeserialized.wallList) {
        // Extrait la ligne, la colonne et le type à partir de la chaîne de caractères
        let [row, col, type] = wallString.split('X');
        console.log("row",row,"col",col,"type",type);
        // Convertit les valeurs de la ligne et de la colonne en nombres
        row = parseInt(row, 10);
        col = parseInt(col, 10);

        // Recherche le mur correspondant dans la base de données
        const wall = await db.collection('walls').findOne({
            "position.row": row,
            "position.col": col,
            "gameBoardId": gameBoardIdDb._id,
            type: type
        });
        console.log("WALL FOUNDED IN DB -> ",wall);

        //met à jour la visibilité des cases
        if (wall) {
            let wallToCopy = null;
            //CHERCHER LES VALEURS A UPDATE
            if(type === 'H'){
                for(let j=0;j<gameModelGlobal.horizontal_Walls.wallList.length;j++){
                    let wall = gameModelGlobal.horizontal_Walls.wallList[j];
                    if(wall.position.row === row && wall.position.col === col){
                        wallToCopy = wall;break;
                    }
                }
            }
            else if(type === 'V'){
                for(let j=0;j<gameModelGlobal.vertical_Walls.wallList.length;j++){
                    let wall = gameModelGlobal.vertical_Walls.wallList[j];
                    if(wall.position.row === row && wall.position.col === col){
                        wallToCopy = wall;break;
                    }
                }
            }

            console.log("wall to put ->", wallToCopy);
            // Met à jour la visibilité du mur dans la base de données
            await db.collection('walls').updateOne({_id: new ObjectId(wall._id)}, {$set: {isPresent: wallToCopy.isPresent, visibility: wallToCopy.visibility, idPlayer: wallToCopy.idPlayer, wallGroup: wallToCopy.wallGroup}});
            for (let square of gameModelGlobal.playable_squares.getAllPlayableSquares()) {
                //update db
                await db.collection('squares').updateOne({ gameBoardId: gameBoardIdDb._id, "position.row": square.position.row, "position.col": square.position.col }, { $set: { isVisible: false , visibility: wall.visibility} });
            }
        }
        else {
            console.log("Wall not found or already present");
        }
    }
}

async function updateWallsAndVisibilityFromDBForExplode(wallToCompute,playerBd,gameBoardIdDb,gameModelGlobal,db){
    console.log("-------------UPDATE WALLS FOR EXPLODE-------------------");
    //console.log("GAMEMODEL GLOBAL WALLS",gameModelGlobal.horizontal_Walls.wallList);
    console.log("gameBoardId -> ",gameBoardIdDb);

    for(let i=0;i<wallToCompute.length;i++){
        let wallFirst = wallToCompute[i];
        if(wallFirst!=null){
            let row = parseInt(wallFirst.position.row);
            let col = parseInt(wallFirst.position.col);
            let type = wallFirst.type;

            const wall = await db.collection('walls').findOne({
                "position.row": row,
                "position.col": col,
                "gameBoardId": gameBoardIdDb._id,
                type: type
            });
            console.log("WALL FROM DB : ",wall);

            //met à jour la visibilité des cases
            if (wall) {
                let wallToCopy = null;
                //CHERCHER LES VALEURS A UPDATE
                if(type === 'H'){
                    for(let j=0;j<gameModelGlobal.horizontal_Walls.wallList.length;j++){
                        let wall = gameModelGlobal.horizontal_Walls.wallList[j];
                        if(wall.position.row === row && wall.position.col === col){
                            console.log("WALL FIND !",wall);
                            wallToCopy = wall;break;
                        }
                    }
                }
                else if(type === 'V'){
                    for(let j=0;j<gameModelGlobal.vertical_Walls.wallList.length;j++){
                        let wall = gameModelGlobal.vertical_Walls.wallList[j];
                        if(wall.position.row === row && wall.position.col === col){
                            console.log("WALL FIND !",wall);
                            wallToCopy = wall;break;
                        }
                    }
                }
                // Met à jour la visibilité du mur dans la base de données
                await db.collection('walls').updateOne({_id: new ObjectId(wall._id)}, {$set: {isPresent: wallToCopy.isPresent, visibility: wallToCopy.visibility, idPlayer: wallToCopy.idPlayer, wallGroup: wallToCopy.wallGroup}});
                for (let square of gameModelGlobal.playable_squares.getAllPlayableSquares()) {
                    await db.collection('squares').updateOne({ gameBoardId: gameBoardIdDb._id, "position.row": square.position.row, "position.col": square.position.col }, { $set: { isVisible: false , visibility: wall.visibility} });
                }
            }
            else {
                //console.log("Wall not found or already present");
            }
        }
    }
}

module.exports = { updateWinnerAndLooserBot,updateWinnerAndLooser,retrieveCharacterFromDb,updatePlayerPositionFromDb,setUpPositionRealBot,createGameDb, saveGame, loadGameFromDb,updatePositionCharacter,manageBotMove,updateCurrentPlayerFromDb,updateWallsAndVisibilityFromBd, updateWallsAndVisibilityFromDBForExplode };
