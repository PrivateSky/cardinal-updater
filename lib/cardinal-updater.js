#!/usr/bin/env node
const PSKWEBCOMPONENTS_GITHUB_URL = "https://github.com/PrivateSky/pskwebcomponents"
const CARDINAL_GITHUB_URL = "https://github.com/PrivateSky/cardinal"

const gulp = require('gulp');
const run = require("gulp-run-command").default;
const spawnSync = require('child_process').spawnSync
const git = require('gulp-git');
const include = require('gulp-include');
const del = require('del');
const fs = require('fs');
const tar = require('tar')
let PSKWEBCOMPONENTS_PATH;
let CARDINAL_PATH;

function init(cb) {
    console.log('1:')
    CARDINAL_PATH = CARDINAL_GITHUB_URL.split('/')[CARDINAL_GITHUB_URL.split('/').length - 1]
    PSKWEBCOMPONENTS_PATH = PSKWEBCOMPONENTS_GITHUB_URL.split('/')[PSKWEBCOMPONENTS_GITHUB_URL.split('/').length - 1]
    cb(installComponents);
}

async function getWebComponents(cb) {
    console.log('2:')
    if (fs.existsSync('../' + PSKWEBCOMPONENTS_PATH)) {
        cb(getCardinal);
    } else {
        await git.clone(PSKWEBCOMPONENTS_GITHUB_URL, { args: '../' + PSKWEBCOMPONENTS_PATH }, function (err) {
            if (err) console.log(err);
            else {
                console.log('somethin')
                cb(getCardinal)
            }
        });
    }
}
function installComponents(cb) {
    console.log('3:')
    let currentDir = process.cwd();
    process.chdir('../' + PSKWEBCOMPONENTS_PATH);
    run('npm install')().then(function () {
        process.chdir(currentDir);
        cb(installCardinal);
    });
}


async function getCardinal(cb) {
    console.log('4:')
    if (fs.existsSync('../' + CARDINAL_PATH)) {
        cb(createBackupFiles);
    } else {
        await git.clone(CARDINAL_GITHUB_URL, { args: '../' + CARDINAL_PATH }, function (err) {
            if (err) console.log(err);
            else {
                cb(createBackupFiles);
            }
        });
    }
};

function installCardinal(cb) {
    console.log('5:')
    let currentDir = process.cwd();
    process.chdir('../' + CARDINAL_PATH);
    run('npm install')().then(function () {
        process.chdir(currentDir);
        cb(deleteFiles);
    });
}

async function createBackupFiles(cb) {
    console.log('6:')
    try {
        await tar.c({
            gzip: true,
            file: 'backup-files.tgz'
        }, ['cardinal', 'cardinal.js', 'themes/default']
        ).then(_ => {
            cb();
        })
    } catch (err) {
        console.log(err);
        cb(updateCardinal)
    }
}

async function deleteFiles(cb) {
    console.log('7:');
    try {
        await del(['./cardinal.js', './cardinal/**', './themes/default/**']);
    } catch (err) {
        console.log(err);
    }
    const currentDir = process.cwd();
    process.chdir('../' + CARDINAL_PATH)
    await del('./release/cardinal/**');
    process.chdir(currentDir)
    cb(copyBuild);
}

function updateCardinal(cb) {
    console.log('8:')
    const currentDir = process.cwd();
    process.chdir('../' + CARDINAL_PATH);
    let buildProcess = spawnSync('gulp build', {
        cwd: process.cwd(), encoding: 'utf8', stdio: 'inherit', shell: true
    })
    if (buildProcess.status === 0) {
        process.chdir(currentDir);
        del('./backup-files.tgz');
        cb()
    } else {
        process.chdir(currentDir);
        buildError();
    }
}

function buildError() {
    console.log('9:')
    tar.x(
        {
            file: 'backup-files.tgz'
        }
    ).then(() => {
        del('./backup-files.tgz');

    })
}

async function copyBuild() {
    console.log('10:')
    await gulp.src('../' + CARDINAL_PATH + '/release/cardinal.js')
        .pipe(include({
            separateInputs: true,
        }))
        .pipe(gulp.dest('./'));

    await gulp.src('../' + CARDINAL_PATH + '/release/cardinal/**/*')
        .pipe(include({
            separateInputs: true,
        }))
        .pipe(gulp.dest('./cardinal'));
    await gulp.src('../' + CARDINAL_PATH + '/release/themes/default/**')
        .pipe(include({
            separateInputs: true,
        }))
        .pipe(gulp.dest('./themes/default/'));
}

init(getWebComponents)