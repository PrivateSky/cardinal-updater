/**
 * Displaying one or multiple warning messages
 * 
 * @param {String | Array<String>} messages 
 */
function warning(messages) {
    if (!Array.isArray(messages)) {
        messages = [messages];
    }

    messages.forEach(msg => {
        console.error(`Error: ${msg}`);
    });
}

/**
 * Closing the program
 * 
 * @param {String} message 
 * @param {Integer} exitCode 
 */
function abort(message, exitCode) {
    warning(message);
    process.exit(exitCode);
}

module.exports = {
    abort,
    warning
}