const git = require("gulp-git");
const utils = require('./utils');

async function cloneProject(githubUrl, destinationPath, callback) {
    await git.clone(githubUrl, { args: destinationPath }, function (err) {
        if (err) {
            utils.warning([`Was not able to clone ${githubUrl}`, err]);
            callback(false);
        } else {
            callback(true);
        }
    });
}

function buildProject(projectPath, callback) {
    let currentDir = process.cwd();
    process.chdir(projectPath);
    run("npm install")().then(function () {
        process.chdir(currentDir);
        callback(true);
    });
}

function deepCopy(arraySourcePaths, destinationPaths, multipleDestinations) {
    if (multipleDestinations &&
        arraySourcePaths.length !== destinationPaths.length) {
        return;
    }

    let outputBuffer;

    if (!multipleDestinations) {
        if (Array.isArray(arraySourcePaths)) {
            outputBuffer = arraySourcePaths.map((path) => {
                return gulp.src(path).pipe(gulp.dest(destinationPaths));
            });
        } else {
            outputBuffer = gulp.src(arraySourcePaths).pipe(gulp.dest(destinationPaths));
        }

        return outputBuffer;
    }

    return arraySourcePaths.map((path, index) => {
        return gulp.src(path).pipe(gulp.dest(destinationPaths[index]));
    });
}

module.exports = {
    deepCopy,
    cloneProject,
    buildProject
}