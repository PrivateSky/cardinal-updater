#!/usr/bin/env node

const _program = require("commander");

const _argsParser = require('./args-parser');
const _moduleInit = require('./module-init');
const _moduleUpdate = require('./module-update');

const VERSION = require("../package").version;

const callbackModulesLst = {
    createApplication: _moduleInit.initApplication,
    updateDependencies: _moduleUpdate.updateDependencies
};

_program
    .name("cardinal")
    .version(VERSION, "    --version")
    .command("init [dir]", "creates an instance of Cardinal.Js withing a directory named [dir]. Default: Cardinal-SSApp")
    .command('update', "updates an existing instance of Cardinal.Js. This must be executed on the root of the project. E.g: $ path/to/Cardinal-SSApp> cardinal update")
    .option("-m, --menu <type>", "<type> set where to dock the application menu. Possible values (left|top). The default value is left.", "left")
    .parse(process.argv);

function main() {
    const executionType = _argsParser.getExecutionType(_program.args);
    if (!executionType) {
        process.exit(-1);
    }

    const { callback, args } = executionType;
    callbackModulesLst[callback].call(this, args, _program);
}

main();