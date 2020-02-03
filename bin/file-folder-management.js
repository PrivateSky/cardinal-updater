const fs = require('fs');
const gulp = require('gulp');

const { error, abort } = require('./utils');

/**
 * Check if the given directory `dir` is empty.
 *
 * @param {String} dir
 * @param {Function} callback
 */

function emptyDirectory(dir, callback) {
    fs.readdir(dir, function(err, files) {
        if (err && err.code !== 'ENOENT') {
            error(err);
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

/**
 * This function will copy everything from a given path to a destination path.
 * If multipleDestinations is true, then the source paths and destination paths will be treated as 
 * @param {string|string[]} arraySourcePaths - List of source paths to copy files from. Also, it can be a single source path.
 * @param {string|string[]} destinationPaths - List of destination paths to copy the files. Also, it can be a single destination path.
 * @param {boolean} multipleDestinations - Conditional parameter to tell the function if there are multiple destinations
 */
function deepCopy(arraySourcePaths, destinationPaths, multipleDestinations) {
    if (multipleDestinations &&
        arraySourcePaths.length !== destinationPaths.length) {
        error("The length of source paths must be the same with destination paths");
    }

    let outputBuffer;
    const options = {
        allowEmpty: true
    };

    if (!multipleDestinations) {
        if (Array.isArray(arraySourcePaths)) {
            outputBuffer = arraySourcePaths.map(function(path) {
                return gulp.src(path, options).pipe(gulp.dest(destinationPaths));
            });
        } else {
            outputBuffer = gulp.src(arraySourcePaths, options).pipe(gulp.dest(destinationPaths));
        }

        return outputBuffer;
    }

    return arraySourcePaths.map(function(path, index) {
        return gulp.src(path, options).pipe(gulp.dest(destinationPaths[index]));
    });
}

/**
 * This function will delete the entire folder structure from the specified path
 * @param {string} path - The path where to delete the folder structure
 */
function removeFolderStructure(path) {
    if (!path || !fs.existsSync(path)) {
        error(`The specified path does not exists: ${path}`);
    }

    _recursiveDeletion(path);
}

/**
 * Recursive deletion function. If a file is given as parameter, the file is deleted. 
 * If a folder is given, the function will iterate over the content and will delete everything.
 * @param {string} sourcePath - Path to delete
 */
function _recursiveDeletion(sourcePath) {
    const statSync = fs.lstatSync(sourcePath);
    if (statSync.isFile()) {
        fs.unlinkSync(sourcePath);
        return;
    }

    const content = fs.readdirSync(sourcePath);
    content.forEach(function(contentPath) {
        const newPath = `${sourcePath}/${contentPath}`;

        _recursiveDeletion(newPath);
    });

    fs.rmdirSync(sourcePath);
}

/**
 * This function accepts a path or a list of paths that will be deleted from disk
 * @param {string|string[]} paths - Paths to be deleted from disk
 */
function cleanDisk(paths, callback) {
    if (!Array.isArray(paths)) {
        paths = [paths];
    }

    paths.forEach(function(path) {
        removeFolderStructure(path);
    });

    callback();
}

module.exports = {
    emptyDirectory,
    mkdir,
    deepCopy,
    removeFolderStructure,
    cleanDisk
}