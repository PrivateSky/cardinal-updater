const fs = require('fs');
const gulp = require('gulp');

const { error, abort, info } = require('./utils');

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
 * Creates a folder if does not exists.
 * Synchronous operation.
 * @param {String} path 
 */
function mkdir(path) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
}

/**
 * @description This function will copy everything from a given path to a destination path in a synchronous manner.
 * @description If source path is a single path, then the source will be copied into the destination.
 * @description If source path is an array and destination path is single path, every source path will be copied into destination path.
 * @description If source path and destination path are arrays, then their length must be equal. The copy will be treated as one to one by index.
 * @param {string|string[]} arraySourcePaths - List of source paths to copy files from. Also, it can be a single source path.
 * @param {string|string[]} destinationPaths - List of destination paths to copy the files. Also, it can be a single destination path.
 */
function deepCopySync(sourcePaths, destinationPaths) {
    if (Array.isArray(sourcePaths)) {

        _validatePathList(sourcePaths.concat(destinationPaths));

        if (Array.isArray(destinationPaths)) {
            if (sourcePaths.length !== destinationPaths.length) {
                abort(`The length of arraySourcePaths and destinationPaths must be the same!`, 1);
            }

            sourcePaths.forEach(function(path, index) {
                _recursiveDeepCopySync(path, destinationPaths[index]);
            });

            return;
        }

        sourcePaths.forEach(function(path) {
            _recursiveDeepCopySync(path, destinationPaths);
        });

        return;
    }

    _validatePathList([sourcePaths, destinationPaths]);
    _recursiveDeepCopySync(sourcePaths, destinationPaths);
}

/**
 * This function is making a depp copy of a file or a folder from a source path to a destination path recursively.
 * @param {string} sourcePath - Single source path to copy a file or folder from. 
 * @param {string} destinationPath - Single destination path to copy a file or folder to. 
 */
function _recursiveDeepCopySync(sourcePath, destinationPath) {
    try {
        let statSyncSource = fs.lstatSync(sourcePath);
        if (statSyncSource.isFile()) {
            if (fs.existsSync(destinationPath) &&
                fs.lstatSync(destinationPath).isDirectory()) {
                filePathSplit = sourcePath.split('\\');
                destinationPath = `${destinationPath}\\${filePathSplit.pop()}`;
            }

            fs.copyFileSync(sourcePath, destinationPath);
            return;
        }

        let statSyncDest = fs.lstatSync(destinationPath);

        if (statSyncSource.isDirectory()) {
            if (!statSyncDest.isDirectory() && !statSyncDest.isFile()) {
                abort([`Destination path is not a directory or a file!`,
                    `${sourcePath} -> ${destinationPath}`
                ], 1);
            }

            fs.readdirSync(sourcePath).forEach(function(content) {
                const newSource = `${sourcePath}\\${content}`;
                const newDest = `${destinationPath}\\${content}`;
                statSyncSource = fs.lstatSync(newSource);

                if (statSyncSource.isDirectory()) {
                    mkdir(newDest);
                }

                _recursiveDeepCopySync(newSource, newDest);
            });
        }
    } catch (err) {
        abort(err, 1);
    }
}

/**
 * This function takes a path or a list of paths and checks if exist on the disk
 * @param {string[]|string} pathList - List of paths to be checked
 */
function _validatePathList(pathList) {
    if (!Array.isArray(pathList)) {
        pathList = [pathList];
    }

    pathList.forEach(function(path) {
        if (!fs.existsSync(path)) {
            abort(`${path} does not exists!`, 1);
        }
    });
}

/**
 * Recursive deletion function. If a file is given as parameter, the file is deleted. 
 * If a folder is given, the function will iterate over the content and will delete everything.
 * @param {string} sourcePath - Path to delete
 */
function _recursiveDeletion(sourcePath) {
    try {
        const statSync = fs.lstatSync(sourcePath);
        if (statSync.isFile()) {
            fs.unlinkSync(sourcePath);
            return;
        }

        const content = fs.readdirSync(sourcePath);
        content.forEach(function(contentPath) {
            const newPath = `${sourcePath}\\${contentPath}`;

            _recursiveDeletion(newPath);
        });

        fs.rmdirSync(sourcePath);
    } catch (err) {
        abort(err, 1);
    }
}

/**
 * This function will delete the entire folder structure from the specified path
 * @param {string} path - The path where to delete the folder structure
 */
function _removeFolderStructure(path) {
    if (!path || !fs.existsSync(path)) {
        error(`The specified path does not exists: ${path}`);
    }

    _recursiveDeletion(path);
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
        _removeFolderStructure(path);
    });

    callback();
}

module.exports = {
    emptyDirectory,
    mkdir,
    deepCopySync,
    cleanDisk
}