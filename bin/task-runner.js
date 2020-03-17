const path = require('path');

const constants = require('./constants');
const utils = require('./utils');
const {
    cloneProject,
    runCommand
} = require('./cardinal-git');
const {
    cleanDiskSync,
    copyCardinalBuild,
    copyPskRelease
} = require('./cardinal-fs');

function startTaskRunner(appPath, workingDirectory = null) {
    utils.taskRunner([{
        method: cloneProject,
        args: {
            githubUrl: `${constants.GITHUB_BASE_PATH_LOCAL}/${constants.PSK_RELEASE_MODULE_NAME}`,
            destinationPath: constants.PSK_RELEASE_MODULE_NAME
        }
    }, {
        method: cloneProject,
        args: {
            githubUrl: `${constants.GITHUB_BASE_PATH}/${constants.CARDINAL_MODULE_NAME}`,
            destinationPath: constants.CARDINAL_MODULE_NAME
        }
    }, {
        method: cloneProject,
        args: {
            githubUrl: `${constants.GITHUB_BASE_PATH}/${constants.CARDINAL_WEBSITE_MODULE_NAME}`,
            destinationPath: constants.CARDINAL_WEBSITE_MODULE_NAME
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
            command: "npm install",
            destinationPath: constants.CARDINAL_WEBSITE_MODULE_NAME
        }
    }, {
        method: runCommand,
        args: {
            command: "npm run build",
            destinationPath: constants.CARDINAL_WEBSITE_MODULE_NAME
        }
    }, {
        method: copyPskRelease,
        args: {
            appPath: appPath
        }
    }, {
        method: copyCardinalBuild,
        args: {
            appPath: appPath
        }
    }, {
        method: cleanDiskSync,
        args: [constants.PSK_RELEASE_MODULE_NAME,
            constants.CARDINAL_WEBSITE_MODULE_NAME,
            constants.CARDINAL_MODULE_NAME,
            constants.BACKUP_ARCHIVE_NAME
        ]
    }]);
}

module.exports = {
    startTaskRunner
};
