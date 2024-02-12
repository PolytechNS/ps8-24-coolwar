// utils.js
function parseJSON(req, callback) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString(); // Convert chunk to string and append it to body
    });
    req.on('end', () => {
        try {
            const data = JSON.parse(body); // Try to parse the accumulated body as JSON
            callback(null, data); // No error, pass null and the parsed data
        } catch (err) {
            callback(err, null); // In case of error, pass it to the callback
        }
    });
}

class Utils {
    getCoordinatesFromID(id) {
        return id.split('X');
    }
}

// Export both parseJSON function and Utils class together
module.exports = { parseJSON, Utils };
