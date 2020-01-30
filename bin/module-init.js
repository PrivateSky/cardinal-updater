const path = require('path');

const utils = require('./utils');
const readline = require('readline');
const fsUsage = require('./fs-usage');

function initApplication(args, _program) {
    console.log(args);
    const appPath = path.resolve(args.appPath);

    // Generate application
    fsUsage.emptyDirectory(appPath, function (empty) {
        if (empty || _program.force) {
            _createApplication(appName, appPath);
        } else {
            _confirm('destination is not empty, continue? [y|yes|ok|trye/n|no|false|cancel|exit] ', function (ok) {
                if (ok) {
                    process.stdin.destroy();
                    _createApplication(appName, appPath);
                } else {
                    utils.abort('Command received', 1);
                }
            })
        }
    })
}

module.exports = {
    initApplication
}

/**
 * Prompt for confirmation on STDOUT/STDIN
 * The test of the user's answer will be true if one of the answers will be provided:
 * y / yes / ok / true
 */

function _confirm(msg, callback) {
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question(msg, function (input) {
        rl.close();
        callback(/^y|yes|ok|true$/i.test(input));
    })
}

/**
 * The main function that will orchestrate the creation of the application
 * 
 * @param {String} appName
 * @param {String} destinationPath
 */
function _createApplication(appPath) {
    console.log(appPath);

    fsUsage.mkdir(appPath);
    const destinationPath = path.resolve(__dirname, appPath);


}