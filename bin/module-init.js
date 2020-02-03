const path = require('path');

const constants = require('./constants');
const { abort, taskRunner, confirm } = require('./utils');
const { cloneProject, runCommand } = require('./github-project-management');
const { emptyDirectory, mkdir, deepCopy, cleanDisk } = require('./file-folder-management');

let appPath;
let program;

function initApplication(args, _program) {
    program = _program;
    appPath = path.resolve(args.appPath);

    // Generate application
    emptyDirectory(appPath, function(empty) {
        if (empty || program.force) {
            _createApplication();
        } else {
            confirm('destination is not empty, continue? [y|yes|ok|trye/n|no|false|cancel|exit] ', function(ok) {
                if (ok) {
                    process.stdin.destroy();
                    _createApplication();
                } else {
                    abort('Aborting process by user command.', 1);
                }
            })
        }
    });
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
    mkdir(appPath);

    /**
     * Copy the baseline structure of the application
     */
    const templateBaselinePath = path.join(__dirname, '..', constants.TEMPLATE_BASELINE_PATH);
    deepCopy(`${templateBaselinePath}/**/*`, appPath);

    /**
     * Copy the index.html file according to the configuration
     */
    if (program.menu === 'left') {
        deepCopy(path.join(__dirname, '..', constants.INDEX_LEFT_MENU), appPath);
    } else {
        deepCopy(path.join(__dirname, '..', constants.INDEX_TOP_MENU), appPath);
    }

    /**
     * Create the other directiories that are needed for the start
     */
    constants.DIRECTORIES_FOR_MKDIR.forEach(__path => {
        mkdir(path.join(appPath, __path));
    });

    /**
     * Run the steps to aquire the final form of the skeleton
     */
    taskRunner([{
        method: cloneProject,
        args: {
            githubUrl: `${constants.GITHUB_BASE_PATH_LOCAL}/${constants.PSK_RELEASE_MODULE_NAME}`,
            destinationPath: constants.PSK_RELEASE_MODULE_NAME
        }
    }, {
        method: cloneProject,
        args: {
            githubUrl: `${constants.GITHUB_BASE_PATH}/${constants.PSKWEBCOMPONENTS_MODULE_NAME}`,
            destinationPath: constants.PSKWEBCOMPONENTS_MODULE_NAME
        }
    }, {
        method: cloneProject,
        args: {
            githubUrl: `${constants.GITHUB_BASE_PATH}/${constants.CARDINAL_MODULE_NAME}`,
            destinationPath: constants.CARDINAL_MODULE_NAME
        }
    }, {
        method: runCommand,
        args: {
            command: "npm install",
            destinationPath: constants.PSKWEBCOMPONENTS_MODULE_NAME
        }
    }, {
        method: runCommand,
        args: {
            command: "npm install",
            destinationPath: constants.CARDINAL_MODULE_NAME
        }
    }, {
        method: runCommand,
        args: {
            command: "npm run build",
            destinationPath: constants.CARDINAL_MODULE_NAME
        }
    }, {
        method: copyPskRelease,
        args: null
    }, {
        method: copyCardinalBuild,
        args: null
    }, {
        method: cleanDisk,
        args: [constants.PSK_RELEASE_MODULE_NAME,
            constants.CARDINAL_MODULE_NAME,
            constants.PSKWEBCOMPONENTS_MODULE_NAME
        ]
    }]);
}

/**
 * This function is copying the files from psk-release to cardinal skeleton
 * @param {null} __unused 
 * @param {Function} next - Callback to be called when the execution is done
 */
function copyPskRelease(__unused, next) {
    const sourcePath = path.join(appPath, constants.PATH_COPY_RELEASE_FROM);
    const destinationPath = path.join(appPath, constants.PATH_COPY_RELEASE_TO);

    deepCopy(sourcePath, destinationPath);

    next();
}

/**
 * This function is copying the files from cardinal+pskwebcomponents to cardinal skeleton
 * @param {null} __unused 
 * @param {Function} next - Callback to be called when the execution is done
 */
function copyCardinalBuild(__unused, next) {
    const sourcePathsCardinal = constants.PATH_COPY_CARDINAL_FROM.map(p => path.join(appPath, p));
    const destinationPathsCardinal = constants.PATH_COPY_CARDINAL_TO.map(p => path.join(appPath, p));

    deepCopy(sourcePathsCardinal, destinationPathsCardinal, true);

    next();
}