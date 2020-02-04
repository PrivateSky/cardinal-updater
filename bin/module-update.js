function init(cb) {
    console.log("Getting the repositories:")
    CARDINAL_PATH = CARDINAL_GITHUB_URL.split("/")[CARDINAL_GITHUB_URL.split("/").length - 1]
    PSKWEBCOMPONENTS_PATH = PSKWEBCOMPONENTS_GITHUB_URL.split("/")[PSKWEBCOMPONENTS_GITHUB_URL.split("/").length - 1]
    cb(installComponents);
}

async function getWebComponents(cb) {
    console.log("Cloning PskWebComponents:")
    if (fs.existsSync("../" + PSKWEBCOMPONENTS_PATH)) {
        cb(getCardinal);
    } else {
        await git.clone(PSKWEBCOMPONENTS_GITHUB_URL, { args: "../" + PSKWEBCOMPONENTS_PATH }, function(err) {
            if (err) console.log(err);
            else {
                cb(getCardinal)
            }
        });
    }
}

function installComponents(cb) {
    console.log("Installing PskWebComponents:")
    let currentDir = process.cwd();
    process.chdir("../" + PSKWEBCOMPONENTS_PATH);
    run("npm install")().then(function() {
        process.chdir(currentDir);
        cb(installCardinal);
    });
}

async function getCardinal(cb) {
    console.log("Cloning Cardinal:")
    if (fs.existsSync("../" + CARDINAL_PATH)) {
        cb(createBackupFiles);
    } else {
        await git.clone(CARDINAL_GITHUB_URL, { args: "../" + CARDINAL_PATH }, function(err) {
            if (err) console.log(err);
            else {
                cb(createBackupFiles);
            }
        });
    }
};

function installCardinal(cb) {
    console.log("Installing Cardinal:")
    let currentDir = process.cwd();
    process.chdir("../" + CARDINAL_PATH);
    run("npm install")().then(function() {
        process.chdir(currentDir);
        cb(deleteFiles);
    });
}

async function createBackupFiles(cb) {
    console.log("Creating the backup tar file:")
    try {
        await tar.c({
            gzip: true,
            file: "backup-files.tgz"
        }, ["cardinal", "cardinal.js", "themes/default"]).then(_ => {
            cb(updateCardinal)
        })
    } catch (err) {
        console.log(err);
        cb(updateCardinal)
    }
}

function deleteFiles(cb) {
    console.log("Deleting the files that will be replaced by the build:");
    if (fs.existsSync("../" + CARDINAL_PATH + "/release")) {
        RecursionDeletion(["./cardinal", "./themes/default", "../cardinal/release/cardinal"], cb)
    } else {
        RecursionDeletion(["./cardinal", "./themes/default"], cb)
    }
}

function RecursionDeletion(folderPath, cb) {
    let folder
    if (typeof folderPath === "string") {
        folder = folderPath
    } else {
        folder = folderPath[0]
    }
    fs.readdir(folder, function(err, files) {
        if (err) {
            console.log(err)
            return err
        } else {
            while (files.length != 0) {
                const path = "/" + files.pop();
                const statSync = fs.lstatSync(folder + path)
                if (statSync.isDirectory()) {
                    RecursionDeletion(folder + path, cb)
                } else {
                    fs.unlinkSync(folder + path);
                }
            }
        }
        if (typeof folderPath !== "string") {
            if (folderPath.length > 1) {
                folderPath.shift();
                RecursionDeletion(folderPath, cb)
            } else {
                fs.unlinkSync("./cardinal.js")
                cb(copyBuild)
            }
        }
    })
}

function updateCardinal(cb, param) {
    console.log("Building Cardinal:")
    const currentDir = process.cwd();
    process.chdir("../" + CARDINAL_PATH);
    let buildProcess = spawnSync("gulp build", {
        cwd: process.cwd(),
        encoding: "utf8",
        stdio: "inherit",
        shell: true
    })
    if (buildProcess.status === 0) {
        process.chdir(currentDir);
        fs.unlinkSync("./backup-files.tgz");
        cb()
    } else {
        process.chdir(currentDir);
        buildError();
    }
}

function buildError() {
    tar.x({
        file: "backup-files.tgz"
    }).then(() => {
        fs.unlinkSync("./backup-files.tgz");

    })
}

function copyBuild() {
    console.log("Copying the files that were created into the current folder:")
    try {
        gitGulpUsage.deepCopy(["../" + CARDINAL_PATH + "/release/cardinal.js", "../" + CARDINAL_PATH + "/release/cardinal/**/*", "../" + CARDINAL_PATH + "/release/themes/**/*"], ["./", "./cardinal/", "./themes/"], true)
    } catch (err) {
        console.log("The files could not be copied, error:", err)
    }
}

const path = require('path');

const { taskRunner } = require('./utils');
const { PATHS_TO_REMOVE_FOR_UPDATE } = require('./constants');
const { cleanDisk } = require('./file-folder-management');

function updateDependencies() {
    const appRootPath = path.resolve('./');
    const cleanDependenciesPath = PATHS_TO_REMOVE_FOR_UPDATE.map(function(_path) {
        return path.join(appRootPath, _path);
    });

    /**
     * Clean the working directory
     */
    cleanDisk(cleanDependenciesPath);

    /**
     * Create the other directiories that are needed for the start
     */
    constants.DIRECTORIES_FOR_MKDIR.forEach(__path => {
        mkdir(path.join(appPath, __path));
    });

    taskRunner([{
        method: cleanDisk,
        args: cleanDependenciesPath
    }]);
    // taskRunner([{
    //     method: cloneProject,
    //     args: {
    //         githubUrl: `${constants.GITHUB_BASE_PATH_LOCAL}/${constants.PSK_RELEASE_MODULE_NAME}`,
    //         destinationPath: constants.PSK_RELEASE_MODULE_NAME
    //     }
    // }, {
    //     method: cloneProject,
    //     args: {
    //         githubUrl: `${constants.GITHUB_BASE_PATH}/${constants.PSKWEBCOMPONENTS_MODULE_NAME}`,
    //         destinationPath: constants.PSKWEBCOMPONENTS_MODULE_NAME
    //     }
    // }, {
    //     method: cloneProject,
    //     args: {
    //         githubUrl: `${constants.GITHUB_BASE_PATH}/${constants.CARDINAL_MODULE_NAME}`,
    //         destinationPath: constants.CARDINAL_MODULE_NAME
    //     }
    // }, {
    //     method: runCommand,
    //     args: {
    //         command: "npm install",
    //         destinationPath: constants.PSKWEBCOMPONENTS_MODULE_NAME
    //     }
    // }, {
    //     method: runCommand,
    //     args: {
    //         command: "npm install",
    //         destinationPath: constants.CARDINAL_MODULE_NAME
    //     }
    // }, {
    //     method: runCommand,
    //     args: {
    //         command: "npm run build",
    //         destinationPath: constants.CARDINAL_MODULE_NAME
    //     }
    // }, {
    //     method: copyPskRelease,
    //     args: null
    // }, {
    //     method: copyCardinalBuild,
    //     args: null
    // }, {
    //     method: cleanDisk,
    //     args: [constants.PSK_RELEASE_MODULE_NAME,
    //         constants.CARDINAL_MODULE_NAME,
    //         constants.PSKWEBCOMPONENTS_MODULE_NAME
    //     ]
    // }]);
}

module.exports = {
    updateDependencies
}