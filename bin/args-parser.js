const constants = require('./constants');
const { error } = require('./utils');

function getExecutionType(args) {
    if (args.length > 2 || args.length < 1) {
        error([`Maximum number of arguments is 2. You have entered ${args.length}: ${args}`,
            `Arguments format: "cardinal update (to fetch the latest updates) or cardinal init (to create an app with default name - Cardinal-SSApp) or cardinal init <SSApp_Name>"`,
            `Write cardinal -h for other helping commands`
        ]);
        return null;
    }

    switch (args[0]) {
        case "init":
            {
                const SSAppName = (args.length === 1) ? constants.DEFAULT_SSAPP_NAME : args[1];

                return {
                    callback: "createApplication",
                    args: {
                        appPath: SSAppName
                    }
                };
            }

        case "update":
            {
                return {
                    callback: "updateDependencies"
                }
            }

        default:
            {
                error([`The first argument should be "init" or "update"`,
                    `Arguments format: "cardinal update (to fetch the latest updates) or cardinal init (to create an app with default name - Cardinal-SSApp) or cardinal init <SSApp_Name>"`,
                    `Write cardinal -h for other helping commands`
                ]);
                return null;
            }
    }
}

module.exports = {
    getExecutionType
}