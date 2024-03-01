
class IAConverter{
    convertOurIndexToVellaIndex(iaIndex){
        return iaIndex + 1;
    }

    convertVellaCooordinatesToOurs(col,row){
        return [9-parseInt(row),parseInt(col)-1];
    }
}

module.exports = {IAConverter}