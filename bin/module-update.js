const path = require('path');

const constants = require('./constants');
const utils = require('./utils');
const fs = require('fs');
const {
    cleanDiskSync,
    createBackup,
    mkdirSync
} = require('./cardinal-fs');
const {
    startTaskRunner
} = require('./task-runner');

function updateDependencies() {
    const appRootPath = path.resolve('./');
    const workingDirectory = path.resolve(appRootPath, '..');
    if (fs.existsSync(workingDirectory)) {
        process.chdir(workingDirectory);
    }

    utils.warnMsg(`Starting to create backup file ${constants.BACKUP_ARCHIVE_NAME}...`);
    createBackup(constants.BACKUP_ARCHIVE_NAME, constants.PATHS_FOR_BACKUP.map(function(_path) {
        return path.join(appRootPath, _path);
    }));
    utils.info(`Backup file created!`);

    /**
     * Clean the working directory
     */
    utils.warnMsg(`Starting to delete old verisions of dependencies...`);
    cleanDiskSync(constants.PATHS_TO_REMOVE_FOR_UPDATE.map(function(_path) {
        return path.join(appRootPath, _path);
    }));
    utils.info(`Old verions of dependencies are now deleted!`);

    /**
     * Create the other directiories that are needed for the start
     */
    utils.warnMsg(`Creating new directories for the update of the dependencies...`);
    constants.DIRECTORIES_FOR_mkdirSync.forEach(__path => {
        mkdirSync(path.join(appRootPath, __path));
    });
    utils.info(`Required directories are created!`);

    /**
     * Run the steps to update all the dependencies
     */
    startTaskRunner(appRootPath, workingDirectory);
}

module.exports = {
    updateDependencies
}