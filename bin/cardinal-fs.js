const fs = require('fs');
const path = require('path');
const tar = require('tar');

const constants = require('./constants');
const utils = require('./utils');

/**
 * Check if the given directory `dir` is empty.
 *
 * @param {String} dir
 */

function emptyDirectorySync(dir) {
    if (!fs.existsSync(dir)) {
        return true;
    }

    const content = fs.readdirSync(dir);
    return !content || !content.length;
}

/**
 * Creates a folder if does not exists.
 * Synchronous operation.
 * @param {String} path
 */
function mkdirSync(_path) {
    if (!fs.existsSync(_path)) {
        fs.mkdirSync(_path);
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
                throw new Error(`The length of arraySourcePaths and destinationPaths must be the same!`);
            }

            sourcePaths.forEach(function(_path, index) {
                _recursiveDeepCopySync(_path, destinationPaths[index]);
            });

            return;
        }

        sourcePaths.forEach(function(_path) {
            _recursiveDeepCopySync(_path, destinationPaths);
        });

        return;
    }

    _validatePathList([sourcePaths, destinationPaths]);
    _recursiveDeepCopySync(sourcePaths, destinationPaths);
}

/**
 * This function accepts a path or a list of paths that will be deleted from disk
 * @param {string|string[]} paths - Paths to be deleted from disk
 */
function cleanDiskSync(paths, callback) {
    if (!Array.isArray(paths)) {
        paths = [paths];
    }

    paths.forEach(function(_path) {
        if (!fs.existsSync(_path)) {
            return;
        }
        _removeFolderStructure(_path);
    });

    if (typeof callback === 'function') {
        callback();
    }
}

/**
 * This function is copying the files from psk-release to cardinal skeleton
 * @param {{appPath:string}} args
 * @param {Function} next - Callback to be called when the execution is done
 */
function copyPskRelease(args, next) {
    const appPath = args.appPath;

    const sourcePath = path.join(appPath, constants.PATH_COPY_RELEASE_FROM);
    const destinationPath = path.join(appPath, constants.PATH_COPY_RELEASE_TO);

    try {
        deepCopySync(sourcePath, destinationPath);

        next();
    } catch (err) {
        next(true);
        console.error(err);
    }
}

/**
 * This function is copying the files from cardinal website + cardinal components to the new cardinal website
 * @param {{appPath:string}} args
 * @param {Function} next - Callback to be called when the execution is done
 */
function copyCardinalBuild(args, next) {
    const appPath = args.appPath;

    const sourcePathsCardinal = constants.PATH_COPY_CARDINAL_FROM.map(p => path.join(appPath, p));
    const destinationPathsCardinal = constants.PATH_COPY_CARDINAL_TO.map(p => path.join(appPath, p));

    try {
        deepCopySync(sourcePathsCardinal, destinationPathsCardinal);

        next();
    } catch (err) {
        next(true);
        console.error(err);
    }
}

/**
 * This function archives a series of files and folders
 * @param {string} backupName - Archive name
 * @param {string|string[]} backupSourcePaths - Sources tha will be archived
 */
function createBackup(backupName, backupSourcePaths) {
    if (!Array.isArray(backupSourcePaths)) {
        backupSourcePaths = [backupSourcePaths];
    }
    backupSourcePaths = backupSourcePaths.filter(function(_path) {
        return fs.existsSync(_path);
    });

    try {
        tar.c({
            gzip: true,
            file: backupName,
            sync: true
        }, backupSourcePaths);

        return true;
    } catch (err) {
        console.error(err);
    }
}

/**
 * This function extracts all the content from an archive
 * @param {string} backupName - Archive name
 * @param {string} appRootPath - Base path of the application
 */
function restoreBackup(backupName) {
    if (!fs.existsSync(backupName)) {
        return;
    }

    try {
        tar.x({
            sync: true,
            file: backupName
        });

        fs.unlinkSync()

        return true;
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    emptyDirectorySync,
    mkdirSync,
    deepCopySync,
    cleanDiskSync,
    copyCardinalBuild,
    copyPskRelease,
    createBackup,
    restoreBackup
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
                throw new Error(`Destination path is not a directory or a file! \n${sourcePath} -> ${destinationPath}`);
            }

            fs.readdirSync(sourcePath).forEach(function(content) {
                const newSource = `${sourcePath}\\${content}`;
                const newDest = `${destinationPath}\\${content}`;
                statSyncSource = fs.lstatSync(newSource);

                if (statSyncSource.isDirectory()) {
                    mkdirSync(newDest);
                }

                _recursiveDeepCopySync(newSource, newDest);
            });
        }
    } catch (err) {
        console.error(err);
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

    pathList.forEach(function(_path) {
        if (!fs.existsSync(_path)) {
            throw new Error(`${_path} does not exists!`);
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
        console.error(err);
    }
}

/**
 * This function will delete the entire folder structure from the specified path
 * @param {string} path - The path where to delete the folder structure
 */
function _removeFolderStructure(_path) {
    if (!_path || !fs.existsSync(_path)) {
        utils.warnMsg(`The specified path does not exists: ${_path}`);
    }

    _recursiveDeletion(_path);
}
