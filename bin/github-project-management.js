const run = require("gulp-run-command").default;
const git = require("gulp-git");

/**
 * This function will clone a github project to the destination path, both given as arguments.
 * If the command is ok, next is called
 * Abort, otherwise
 * @param {{githubUrl: string, destinationPath: string}} args 
 * @param {Function} next 
 */
function cloneProject(args, next) {
    const { githubUrl, destinationPath } = args;

    git.clone(githubUrl, { args: destinationPath }, function(err) {
        if (!err) {
            next();
        } else {
            abort(err, 1);
        }
    });
}

/**
 * This function will execute a command on a destination working directory, both given as arguments.
 * If the command is ok, next is called
 * Abort, otherwise
 * @param {{command: string, destinationPath: string}} args 
 * @param {Function} next 
 */
function runCommand(args, next) {
    const { command, destinationPath } = args;

    let currentDir = process.cwd();
    process.chdir(destinationPath);
    run(command)().then(function() {
        process.chdir(currentDir);
        next();
    });
}

module.exports = {
    cloneProject,
    runCommand
};