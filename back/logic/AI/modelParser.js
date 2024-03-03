exports.computeVisibilityPlayableSquare = function (gameModel, currentPlayerIndex) {
    console.log("----COMPUTE VISIBILITY PLAYABLE SQUARE----");
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
      if(currentPlayerIndex === 2){
          if (parseInt(ownPosition.row) === parseInt(row) && parseInt(ownPosition.col) === parseInt(col)){
              board[row][col] = 1;
          }
          else if (parseInt(opponentPosition.row) === parseInt(row) && parseInt(opponentPosition.col) === parseInt(col)){
              board[row][col] = 2;
          }
          else if(parseInt(square.visibility) < 0){board[row][col] = -1;}
          else if(parseInt(square.visibility) >= 0){board[row][col] = 0;}
      }
      else if(currentPlayerIndex === 1){
            if(parseInt(square.visibility) >= 0){
                board[row][col] = 0;
            }
            else if (parseInt(square.visibility) < 0){
                board[row][col] = -1;
            }
            if (parseInt(ownPosition.row) === parseInt(row) && parseInt(ownPosition.col) === parseInt(col)){
                board[row][col] = 1;
            }
            else if (parseInt(opponentPosition.row) === parseInt(row) && parseInt(opponentPosition.col) === parseInt(col) && parseInt(square.visibility) >= 0){
                board[row][col] = 2;
            }
        }
   });
    let boardToReturn = board.reverse();
    console.log("----END COMPUTE VISIBILITY PLAYABLE SQUARE----");
   return boardToReturn;
}

function convertOurCoordinatesToVellaCooordinates(row,col){
    return [parseInt(col)+1,9-parseInt(row)];
}



exports.getWallOpponent = function (gameModel) {
    console.log("----GET WALL OPPONENT----");
    console.log("CURRENT PLAYER ",gameModel.currentPlayer);
   let wallsReturn =[];
   let wallGroupList = [];
   //inverse current player
    let currentPlayerOpponent = null;
    if(gameModel.currentPlayer === 1){
        console.log("CURRENT PLAYER 1 --> OPPONENT = 2");
        currentPlayerOpponent = 2;
    }else{
        console.log("CURRENT PLAYER 2 --> OPPONENT = 1");
        currentPlayerOpponent = 1;
    }

    gameModel.horizontal_Walls.getAllWalls().forEach((wall) => {
        if(parseInt(wall.idPlayer) === currentPlayerOpponent  && parseInt(wall.idPlayer) !== null ){
            console.log("OPPONENT HAS PLACING THIS WALL");
            if(wallGroupList.includes(wall.wallGroup)===false){
                console.log("ADD WALL TO WALLS RETURN");
                wallGroupList.push(wall.wallGroup);
                let wallVella = convertOurCoordinatesToVellaCooordinates(wall.position.row, wall.position.col);
                let wallToPush = [wallVella[0]+""+wallVella[1], 0];
                wallsReturn.push(wallToPush);
            }
        }
    });
    gameModel.vertical_Walls.getAllWalls().forEach((wall) => {
        if(parseInt(wall.idPlayer) === currentPlayerOpponent && parseInt(wall.idPlayer) !== null){
            if(wallGroupList.includes(wall.wallGroup)===false){
                wallGroupList.push(wall.wallGroup);
                let wallVella = convertOurCoordinatesToVellaCooordinates(wall.position.row, wall.position.col);
                let wallToPush = [wallVella[0]+""+wallVella[1], 1];
                wallsReturn.push(wallToPush);
            }
        }
    });

    console.log("----END GET WALL OPPONENT----");
   return wallsReturn;
}

exports.getOwnWalls = function (gameModel) {
    let wallsReturn =[];
    let wallGroupList = [];

     gameModel.horizontal_Walls.getAllWalls().forEach((wall) => {
          if(parseInt(wall.idPlayer) === gameModel.currentPlayer && parseInt(wall.idPlayer) !== null){
              if(wallGroupList.includes(wall.wallGroup)===false){
                  wallGroupList.push(wall.wallGroup);
                  let wallVella = convertOurCoordinatesToVellaCooordinates(wall.position.row, wall.position.col);
                  let wallToPush = [wallVella[0]+""+wallVella[1], 0];
                  wallsReturn.push(wallToPush);
              }
          }
     });

    gameModel.vertical_Walls.getAllWalls().forEach((wall) => {
        if(parseInt(wall.idPlayer) === gameModel.currentPlayer && parseInt(wall.idPlayer) !== null){
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
