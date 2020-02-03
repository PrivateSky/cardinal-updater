const path = require('path');
const readline = require('readline');
const gulp = require('gulp');
const run = require("gulp-run-command").default;
const git = require("gulp-git");

const utils = require('./utils');
const fsUsage = require('./fs-usage');
const constants = require('./constants');

let appPath;
let program;

function initApplication(args, _program) {
    program = _program;
    appPath = path.resolve(args.appPath);

    // Generate application
    fsUsage.emptyDirectory(appPath, function(empty) {
        if (empty || program.force) {
            _createApplication();
        } else {
            _confirm('destination is not empty, continue? [y|yes|ok|trye/n|no|false|cancel|exit] ', function(ok) {
                if (ok) {
                    process.stdin.destroy();
                    _createApplication();
                } else {
                    utils.abort('Command received', 1);
                }
            })
        }
    });
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

    rl.question(msg, function(input) {
        rl.close();
        callback(/^y|yes|ok|true$/i.test(input));
    });
}

/**
 * The main function that will orchestrate the creation of the application
 */
function _createApplication() {
    /**
     * Create the root of the application
     */
    fsUsage.mkdir(appPath);

    /**
     * Copy the baseline structure of the application
     */
    const templateBaselinePath = path.join(__dirname, '..', constants.TEMPLATE_BASELINE_PATH);
    _deepCopy(`${templateBaselinePath}/**/*`, appPath);

    /**
     * Copy the index.html file according to the configuration
     */
    if (program.menu === 'left') {
        _deepCopy(path.join(__dirname, '..', constants.INDEX_LEFT_MENU), appPath);
    } else {
        _deepCopy(path.join(__dirname, '..', constants.INDEX_TOP_MENU), appPath);
    }

    /**
     * Create the other directiories that are needed for the start
     */
    constants.DIRECTORIES_FOR_MKDIR.forEach(__path => {
        fsUsage.mkdir(path.join(appPath, __path));
    });

    /**
     * Begin the process of instalation of projects
     */
    _clonePskRelease();
}

async function _clonePskRelease() {
    console.log('Clone psk-release');
    await git.clone(`${constants.GITHUB_BASE_PATH_LOCAL}/${constants.PSK_RELEASE_MODULE_NAME}`, { args: constants.PSK_RELEASE_MODULE_NAME },
        function(err) {
            if (!err) {
                _copyPskRelease();
            } else {
                utils.abort(err, 1);
            }
        });
}

function _copyPskRelease() {
    console.log('Copy psk-release files');

    const sourcePath = path.join(appPath, constants.PATH_COPY_RELEASE_FROM);
    const destinationPath = path.join(appPath, constants.PATH_COPY_RELEASE_TO);

    /**
     * Copy the build files from psk-release
     */
    _deepCopy(sourcePath, destinationPath);

    /**
     * Continue with cloning pskwebcomponents repository
     */
    _clonePskWebComp();
}

async function _clonePskWebComp() {
    console.log('Clone pskwebcomp');
    await git.clone(`${constants.GITHUB_BASE_PATH}/${constants.PSKWEBCOMPONENTS_MODULE_NAME}`, { args: constants.PSKWEBCOMPONENTS_MODULE_NAME },
        function(err) {
            if (!err) {
                _installPskWebComp();
            } else {
                utils.abort(err, 1);
            }
        });
}

function _installPskWebComp() {
    console.log('Install pskwebcomp');
    let currentDir = process.cwd();
    process.chdir(constants.PSKWEBCOMPONENTS_MODULE_NAME);
    run("npm install")().then(function() {
        process.chdir(currentDir);
        _cloneCardinal();
    });
}

async function _cloneCardinal() {
    console.log('Clone cardinal');
    await git.clone(`${constants.GITHUB_BASE_PATH}/${constants.CARDINAL_MODULE_NAME}`, { args: constants.CARDINAL_MODULE_NAME },
        function(err) {
            if (!err) {
                _installCardinal();
            } else {
                utils.abort(err, 1);
            }
        });
}

function _installCardinal() {
    console.log('Install cardinal');
    let currentDir = process.cwd();
    process.chdir(constants.CARDINAL_MODULE_NAME);
    run("npm install")().then(function() {
        process.chdir(currentDir);
        _buildCardinal();
    });
}

function _buildCardinal() {
    console.log('Build cardinal');
    let currentDir = process.cwd();
    process.chdir(constants.CARDINAL_MODULE_NAME);
    run("npm run build")().then(function() {
        process.chdir(currentDir);
        _copyCardinalBuild();
    });
}

function _copyCardinalBuild() {
    console.log('Copy cardinal build');
    const sourcePathsCardinal = constants.PATH_COPY_CARDINAL_FROM.map(p => path.join(appPath, p));
    const destinationPathsCardinal = constants.PATH_COPY_CARDINAL_TO.map(p => path.join(appPath, p));

    _deepCopy(sourcePathsCardinal, destinationPathsCardinal, true);
}

function _deepCopy(arraySourcePaths, destinationPaths, multipleDestinations) {
    if (multipleDestinations &&
        arraySourcePaths.length !== destinationPaths.length) {
        return;
    }

    let outputBuffer;
    const options = {
        allowEmpty: true
    };

    if (!multipleDestinations) {
        if (Array.isArray(arraySourcePaths)) {
            outputBuffer = arraySourcePaths.map((path) => {
                return gulp.src(path, options).pipe(gulp.dest(destinationPaths));
            });
        } else {
            outputBuffer = gulp.src(arraySourcePaths, options).pipe(gulp.dest(destinationPaths));
        }

        return outputBuffer;
    }

    return arraySourcePaths.map((path, index) => {
        return gulp.src(path, options).pipe(gulp.dest(destinationPaths[index]));
    });
}