
class IAConverter{
    convertOurIndexToVellaIndex(iaIndex){
        return iaIndex + 1;
    }

    convertVellaCooordinatesToOurs(col,row){
        return [9-parseInt(row),parseInt(col)-1];
    }

    convertMoveToOurMove(move){
        console.log("MOVE BEFORE CONVERSION : ",move);
        let row = 9-parseInt(move.value[1]);
        let col = parseInt(move.value[0])-1;
        let moveToReturn = {action:move.action,value:row.toString()+col.toString()};
        console.log("MOVE AFTER CONVERSION : ",moveToReturn);
        return moveToReturn;
    }
}

module.exports = {IAConverter}