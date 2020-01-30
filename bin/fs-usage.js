const fs = require('fs');

/**
 * Check if the given directory `dir` is empty.
 *
 * @param {String} dir
 * @param {Function} callback
 */

function emptyDirectory(dir, callback) {
    fs.readdir(dir, function (err, files) {
        if (err && err.code !== 'ENOENT') {
            throw err;
        }
        callback(!files || !files.length);
    });
}

/**
 * Creates a folder if does not exists
 * 
 * @param {String} path 
 */
function mkdir(path) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
}

module.exports = {
    emptyDirectory,
    mkdir
}