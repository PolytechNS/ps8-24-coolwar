exports.computeVisibilityPlayableSquare = function (gameModel, currentPlayerIndex) {
   let board = Array(9).fill().map(() => Array(9).fill(0));
    let ownPosition = gameModel.player_array.getAllPlayers[currentPlayerIndex].position;
    let opponentPosition = gameModel.player_array.getAllPlayers[1 - currentPlayerIndex].position;
   // Remplir le tableau 9x9 par les visibilités des PlayableSquares
    gameModel.playableSquares.getAllPlayableSquares().forEach((square) => {
      let { row, col } = square.position;
      if(currentPlayerIndex === 1){
          if(square.visibility <= 0){
              board[row][col] = 0;
          }
          else if (square.visibility > 0){
              board[row][col] = -1;
          }
          if (ownPosition.position.row === row && ownPosition.position.col === col){
              board[row][col] = 1;
          }
          else if (opponentPosition.position.row === row && opponentPosition.position.col === col && square.visibility >= 0){
              board[row][col] = 2;
          }
      }
      else if(currentPlayerIndex === 2){
            if(square.visibility >= 0){
                board[row][col] = 0;
            }
            else if (square.visibility < 0){
                board[row][col] = -1;
            }
            if (ownPosition.position.row === row && ownPosition.position.col === col){
                board[row][col] = 1;
            }
            else if (opponentPosition.position.row === row && opponentPosition.position.col === col && square.visibility <= 0){
                board[row][col] = 2;
            }
        }
   });

   return board.reverse();
}


exports.getWallOpponent = function (gameModel) {
   let wallsReturn =[];

    gameModel.horizontal_Walls.getAllWalls().forEach((wall) => {
        if(wall.idPlayer !== gameModel.currentPlayer){
            let wallToPush = [wall.position.toString(), 0];
             wallsReturn.push(wallToPush);
        }
    });
    gameModel.vertical_Walls.getAllWalls().forEach((wall) => {
        if(wall.idPlayer !== gameModel.currentPlayer){
            let wallToPush = [wall.position.toString(), 1];
            wallsReturn.push(wallToPush);
        }
    });
   return wallsReturn;
}

exports.getOwnWalls = function (gameModel) {
    let wallsReturn =[];

     gameModel.horizontal_Walls.getAllWalls().forEach((wall) => {
          if(wall.idPlayer === gameModel.currentPlayer){
              let wallToPush = [wall.position.toString(), 0];
              wallsReturn.push(wallToPush);
          }
     });

    gameModel.vertical_Walls.getAllWalls().forEach((wall) => {
        if(wall.idPlayer === gameModel.currentPlayer){
            let wallToPush = [wall.position.toString(), 1];
            wallsReturn.push(wallToPush);
        }
    });
    return wallsReturn;
}
