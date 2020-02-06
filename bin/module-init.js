const path = require('path');

const constants = require('./constants');
const utils = require('./utils');
const {
    emptyDirectorySync,
    mkdirSync,
    deepCopySync
} = require('./cardinal-fs');

const {
    startTaskRunner
} = require('./task-runner');

let appPath;
let program;

function initApplication(args, _program) {
    program = _program;
    appPath = path.resolve(args.appPath);

    // Generate application
    if (emptyDirectorySync(appPath) || program.force) {
        _createApplication();
    } else {
        utils.confirm('destination is not empty, continue? [y|yes|ok|trye/n|no|false|cancel|exit] ', function(ok) {
            if (ok) {
                process.stdin.destroy();
                _createApplication();
            } else {
                utils.abort('Aborting process by user command.', 1);
            }
        });
    }
}

module.exports = {
    initApplication
}

/**
 * The main function that will orchestrate the creation of the application
 */
function _createApplication() {
    /**
     * Create the root of the application
     */
    mkdirSync(appPath);

    /**
     * Copy the baseline structure of the application
     */
    const templateBaselinePath = path.join(__dirname, '..', constants.TEMPLATE_BASELINE_PATH);
    deepCopySync(templateBaselinePath, appPath);

    /**
     * Copy the index.html file according to the configuration
     */
    if (program.menu === 'left') {
        deepCopySync(path.join(__dirname, '..', constants.INDEX_LEFT_MENU), appPath);
    } else {
        deepCopySync(path.join(__dirname, '..', constants.INDEX_TOP_MENU), appPath);
    }

    /**
     * Create the other directiories that are needed for the start
     */
    constants.DIRECTORIES_FOR_mkdirSync.forEach(__path => {
        mkdirSync(path.join(appPath, __path));
    });

    /**
     * Run the steps to aquire the final form of the skeleton
     */
    startTaskRunner(appPath);
}