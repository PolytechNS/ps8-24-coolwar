exports.computeVisibilityPlayableSquare = function (gameModel, currentPlayerIndex) {
   let board = Array(9).fill().map(() => Array(9).fill(0));
    let ownPosition = gameModel.player_array.getPlayer(currentPlayerIndex).position;
    let currentPlayerOpponent = null;
    if (currentPlayerIndex === 1) {
        currentPlayerOpponent = currentPlayerIndex + 1;
    } else {
        currentPlayerOpponent = currentPlayerIndex - 1;
    }
    let opponentPosition = gameModel.player_array.getPlayer(currentPlayerOpponent).position;
   // Remplir le tableau 9x9 par les visibilités des PlayableSquares
    gameModel.playable_squares.getAllPlayableSquares().forEach((square) => {
      let { row, col } = square.position;
      if(currentPlayerIndex === 1){
          if(square.visibility <= 0){
              board[row][col] = 0;
          }
          else if (square.visibility > 0){
              board[row][col] = -1;
          }
          if (ownPosition.row === row && ownPosition.col === col){
              board[row][col] = 1;
          }
          else if (opponentPosition.row === row && opponentPosition.col === col && square.visibility <= 0){
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
            if (ownPosition.row === row && ownPosition.col === col){
                board[row][col] = 1;
            }
            else if (opponentPosition.row === row && opponentPosition.col === col && square.visibility >= 0){
                board[row][col] = 2;
            }
        }
   });
    let boardToReturn = board.reverse();
   return boardToReturn;
}

function convertOurCoordinatesToVellaCooordinates(row,col){
    return [parseInt(col)+1,9-parseInt(row)];
}



exports.getWallOpponent = function (gameModel) {
    console.log("GETWALL OPPONENT -> CURR PLAYER ",gameModel.currentPlayer);
   let wallsReturn =[];
   let wallGroupList = [];
   //inverse current player
    let currentPlayerOpponent = null;
    if(gameModel.currentPlayer === 1){
        currentPlayerOpponent = 2;
    }else{
        currentPlayerOpponent = 1;
    }

    gameModel.horizontal_Walls.getAllWalls().forEach((wall) => {
        if(wall.idPlayer === currentPlayerOpponent  && wall.idPlayer !== null ){
            if(wallGroupList.includes(wall.wallGroup)===false){
                wallGroupList.push(wall.wallGroup);
                let wallVella = convertOurCoordinatesToVellaCooordinates(wall.position.row, wall.position.col);
                let wallToPush = [wallVella[0]+""+wallVella[1], 0];
                wallsReturn.push(wallToPush);
            }
        }
    });
    gameModel.vertical_Walls.getAllWalls().forEach((wall) => {
        if(wall.idPlayer === currentPlayerOpponent && wall.idPlayer !== null){
            if(wallGroupList.includes(wall.wallGroup)===false){
                wallGroupList.push(wall.wallGroup);
                let wallVella = convertOurCoordinatesToVellaCooordinates(wall.position.row, wall.position.col);
                let wallToPush = [wallVella[0]+""+wallVella[1], 1];
                wallsReturn.push(wallToPush);
            }
        }
    });

   return wallsReturn;
}

exports.getOwnWalls = function (gameModel) {
    let wallsReturn =[];
    let wallGroupList = [];

     gameModel.horizontal_Walls.getAllWalls().forEach((wall) => {
          if(wall.idPlayer === gameModel.currentPlayer){
              if(wallGroupList.includes(wall.wallGroup)===false){
                  wallGroupList.push(wall.wallGroup);
                  let wallVella = convertOurCoordinatesToVellaCooordinates(wall.position.row, wall.position.col);
                  let wallToPush = [wallVella[0]+""+wallVella[1], 0];
                  wallsReturn.push(wallToPush);
              }
          }
     });

    gameModel.vertical_Walls.getAllWalls().forEach((wall) => {
        if(wall.idPlayer === gameModel.currentPlayer){
            if(wallGroupList.includes(wall.wallGroup)===false){
                wallGroupList.push(wall.wallGroup);
                let wallVella = convertOurCoordinatesToVellaCooordinates(wall.position.row, wall.position.col);
                let wallToPush = [wallVella[0]+""+wallVella[1], 1];
                wallsReturn.push(wallToPush);
            }
        }
    });
    return wallsReturn;
}
