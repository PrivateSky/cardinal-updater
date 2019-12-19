#!/usr/bin/env node
const gulp = require('gulp');
const run = require("gulp-run-command").default;
const git = require('gulp-git');
const fs = require('fs');
const { series } = require('gulp');

// function processUpdateCommand(args) {
//     console.log(`Received update command with arguments ", ${args}`);
// }
// try {
//     processUpdateCommand(process.argv);
// }
// catch (e) {
//     console.error(e);
// }


function getWebComponents(cb) {
    let currentDir = process.cwd();
    if (fs.existsSync('../pskwebcomponents')) {
        process.chdir('../pskwebcomponents');
        run('npm install')().then(function () {
            process.chdir(currentDir);
            cb();
        });
    } else {
        git.clone('https://github.com/PrivateSky/pskwebcomponents', { args: '../pskwebcomponents' }, function (err) {
            if (err) console.log(err);
        });
        process.chdir('../pskwebcomponents');
        run('npm install')().then(function () {
            process.chdir(currentDir);
            cb();
        });
    }
};

function getCardinal(cb) {
    let currentDir = process.cwd();
    if (fs.existsSync('../cardinal')) {
        process.chdir('../cardinal');
        run('npm install')().then(function () {
            process.chdir(currentDir);
            cb();
        });
    } else {
        git.clone('https://github.com/PrivateSky/cardinal', { args: '../cardinal' }, function (err) {
            if (err) console.log(err);
        });
        process.chdir('../cardinal');
        run('npm install')().then(function () {
            process.chdir(currentDir);
            cb();
        });
    }
};

function updateCardinal(cb) {
    const currentDir = process.cwd();
    process.chdir('../cardinal');
    run('gulp build')().then(function () {
        process.chdir(currentDir);
        cb();
    });
}

exports.build = series(getWebComponents, getCardinal, updateCardinal);