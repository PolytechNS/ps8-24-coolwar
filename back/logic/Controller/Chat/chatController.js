const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'mots_interdits.txt');

let forbiddenRegExp;

fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) {
        console.error('Erreur lors du chargement des mots interdits:', err);
        return;
    }
    const words = content.split(/\r?\n/).filter(word => word.trim() !== '');
    forbiddenRegExp = new RegExp(`\\b(${words.join('|')})\\b`, 'i');
});

exports.verifyMessage = function (message) {
    // Retourner false si l'expression régulière n'a pas encore été initialisée
    if (!forbiddenRegExp) {
        console.error('La liste des mots interdits n\'est pas encore chargée.');
        return false;
    }

    return !forbiddenRegExp.test(message);
};
