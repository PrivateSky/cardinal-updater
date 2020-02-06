const path = require('path');
const readline = require('readline');
const constants = require('./constants');
const {
    cleanDiskSync,
    restoreBackup
} = require('./cardinal-fs');

/**
 * Displaying one or multiple warning messages
 * 
 * @param {String|String[]} messages 
 */
function info(messages) {
    if (!Array.isArray(messages)) {
        messages = [messages];
    }

    messages.forEach(msg => {
        _displayMessage(constants.MESSAGES_TYPES.INFO, `\n[  INFO  ]: ${msg}\n`);
    });
}

/**
 * Displaying one or multiple warning messages
 * 
 * @param {String|String[]} messages 
 */
function warnMsg(messages) {
    if (!Array.isArray(messages)) {
        messages = [messages];
    }

    messages.forEach(msg => {
        _displayMessage(constants.MESSAGES_TYPES.WARNING, `\n[  WARN  ]: ${msg}\n`);
    });
}

/**
 * Display error message
 * 
 * @param {String|String[]} message 
 */
function error(messages) {
    if (!Array.isArray(messages)) {
        messages = [messages];
    }

    messages.forEach(msg => {
        _displayMessage(constants.MESSAGES_TYPES.ERROR, `\n[  ERROR  ]: ${msg}\n`);
    });
}

/**
 * Closing the program
 * 
 * @param {String|String[]} messages
 * @param {number} exitCode 
 */
function abort(messages, exitCode) {
    error(messages);

    process.exit(exitCode);
}

/**
 * This function takes as argument a list of tasks and it executes them in the given sequence
 * @param {{method: Function, args: any}[]} taskList - The list of the tasks that will be executed
 */
function taskRunner(taskList = []) {
    if (taskList.length === 0) {
        return;
    }

    let self = this;
    let task = taskList.shift();
    info(`Running task ${task.method.name} with arguments ${task.args ? JSON.stringify(task.args) : 'null'}`);
    task.method.call(self, task.args, next);

    /**
     * This function will be called by the task when it is finished, so it can go to the next task
     * @param {boolean} rollback - optional. default value false. Triggers the rollback of the taskRunner
     */
    function next(stop = false) {
        if (stop) {
            restoreBackup(constants.BACKUP_ARCHIVE_NAME);
            cleanDiskSync([constants.PSK_RELEASE_MODULE_NAME,
                constants.CARDINAL_MODULE_NAME,
                constants.PSKWEBCOMPONENTS_MODULE_NAME,
                constants.BACKUP_ARCHIVE_NAME
            ]);
            return;
        }

        info(`Task ${task.method.name} is now completed!`);

        if (taskList && taskList.length > 0) {
            task = taskList.shift();
            info(`Running task ${task.method.name} with arguments ${task.args ? JSON.stringify(task.args) : 'null'}`);
            task.method.call(self, task.args, next);
        } else {
            info("The process is now completed!");
        }
    }
}

/**
 * Prompt for confirmation on STDOUT/STDIN
 * The test of the user's answer will be true if one of the answers will be provided:
 * y / yes / ok / true
 */

function confirm(msg, callback) {
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question(msg, function(input) {
        rl.close();
        callback(/^y|yes|ok|true$/i.test(input));
    });
}

module.exports = {
    info,
    abort,
    warnMsg,
    error,
    taskRunner,
    confirm
}

/**
 * Function that displays a message with a type
 * @param {string} type 
 * @param {string} message 
 */
function _displayMessage(type, message) {
    console.log(type, message);
}