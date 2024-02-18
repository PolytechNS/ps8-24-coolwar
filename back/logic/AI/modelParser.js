exports.computeVisibilityPlayableSquare = function (playableSquares) {
   let board = Array(9).fill().map(() => Array(9).fill(0));

   // Remplir le tableau 9x9 par les visibilités des PlayableSquares
   playableSquares.getAllPlayableSquares().forEach((square) => {
      let { row, col } = square.position;
      board[row][col] = square.visibility;
   });

   return board.reverse();
}

exports.getWallOpponent = function (gameModel) {
   let wallsReturn =[];
   console.log("current player");
    console.log(gameModel.currentPlayer);

    gameModel.horizontal_Walls.getAllWalls().forEach((wall) => {
        if(wall.idPlayer !== gameModel.currentPlayer){
             wallsReturn.push(wall);
        }
    });
   return wallsReturn;
}

exports.getOwnWalls = function (gameModel) {
    let wallsReturn =[];
    console.log("current player");
     console.log(gameModel.currentPlayer);

     gameModel.horizontal_Walls.getAllWalls().forEach((wall) => {
          if(wall.idPlayer === gameModel.currentPlayer){
                 wallsReturn.push(wall);
          }
     });
    return wallsReturn;
}
