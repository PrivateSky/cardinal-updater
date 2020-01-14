#!/usr/bin/env node
const PSKWEBCOMPONENTS_GITHUB_URL = "https://github.com/PrivateSky/pskwebcomponents"
const CARDINAL_GITHUB_URL = "https://github.com/PrivateSky/cardinal"

const gulp = require('gulp');
const run = require("gulp-run-command").default;
const spawnSync = require('child_process').spawnSync
const git = require('gulp-git');
const include = require('gulp-include');
const fs = require('fs');
const tar = require('tar');
let PSKWEBCOMPONENTS_PATH;
let CARDINAL_PATH;

function init(cb) {
    console.log('Getting the repositories:')
    CARDINAL_PATH = CARDINAL_GITHUB_URL.split('/')[CARDINAL_GITHUB_URL.split('/').length - 1]
    PSKWEBCOMPONENTS_PATH = PSKWEBCOMPONENTS_GITHUB_URL.split('/')[PSKWEBCOMPONENTS_GITHUB_URL.split('/').length - 1]
    cb(installComponents);
}

async function getWebComponents(cb) {
    console.log('Cloning PskWebComponents:')
    if (fs.existsSync('../' + PSKWEBCOMPONENTS_PATH)) {
        cb(getCardinal);
    } else {
        await git.clone(PSKWEBCOMPONENTS_GITHUB_URL, { args: '../' + PSKWEBCOMPONENTS_PATH }, function (err) {
            if (err) console.log(err);
            else {
                cb(getCardinal)
            }
        });
    }
}
function installComponents(cb) {
    console.log('Installing PskWebComponents:')
    let currentDir = process.cwd();
    process.chdir('../' + PSKWEBCOMPONENTS_PATH);
    run('npm install')().then(function () {
        process.chdir(currentDir);
        cb(installCardinal);
    });
}


async function getCardinal(cb) {
    console.log('Cloning Cardinal:')
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
    console.log('Installing Cardinal:')
    let currentDir = process.cwd();
    process.chdir('../' + CARDINAL_PATH);
    run('npm install')().then(function () {
        process.chdir(currentDir);
        cb(deleteFiles);
    });
}

async function createBackupFiles(cb) {
    console.log('Creating the backup tar file:')
    try {
        await tar.c({
            gzip: true,
            file: 'backup-files.tgz'
        }, ['cardinal', 'cardinal.js', 'themes/default']
        ).then(_ => {
            cb(updateCardinal)
        })
    } catch (err) {
        console.log(err);
        cb(updateCardinal)
    }
}

async function deleteFiles(cb) {
    console.log('Deleting the files that will be replaced by the build:');
    try {
        await RecursionDeletion('./cardinal');
        await RecursionDeletion('./themes/default');
        await RecursionDeletion('../cardinal/release/cardinal');
        await fs.unlinkSync('./cardinal.js');
    } catch (err) {
        console.log(err);
    }

    cb(copyBuild);
}

async function RecursionDeletion(folderPath) {
    fs.readdirSync(folderPath, function (err, files) {
        if (err) {
            console.log(err)
        } else {
            while (files.length != 0) {
                const path = '/' + files.pop();
                const statSync=fs.lstatSync(folderPath + path)
                if (statSync.isDirectory()) {
                    RecursionDeletion(folderPath + path)
                } else {
                    fs.unlinkSync(folderPath + path);
                }
            }
        }
    })
}

function updateCardinal(cb) {
    console.log('Building Cardinal:')
    const currentDir = process.cwd();
    process.chdir('../' + CARDINAL_PATH);
    let buildProcess = spawnSync('gulp build', {
        cwd: process.cwd(), encoding: 'utf8', stdio: 'inherit', shell: true
    })
    if (buildProcess.status === 0) {
        process.chdir(currentDir);
        fs.unlinkSync('./backup-files.tgz');
        cb()
    } else {
        process.chdir(currentDir);
        buildError();
    }
}

function buildError() {
    tar.x(
        {
            file: 'backup-files.tgz'
        }
    ).then(() => {
        fs.unlinkSync('./backup-files.tgz');

    })
}

async function copyBuild() {
    console.log('Copying the files that were created into the current folder:')
    try {
        await gulp.src('../' + CARDINAL_PATH + '/release/cardinal.js')
            .pipe(include({
                separateInputs: true,
            }))
            .pipe(gulp.dest('./'));

        await gulp.src('../' + CARDINAL_PATH + '/release/cardinal/*/**')
            .pipe(include({
                separateInputs: true,
            }))
            .pipe(gulp.dest('./cardinal'));
        await gulp.src('../' + CARDINAL_PATH + '/release/themes/default/*')
            .pipe(include({
                separateInputs: true,
            }))
            .pipe(gulp.dest('./themes/default/'));
        console.log("Action successful!")
    } catch (err) {
        console.log("The files couldn't be copied, error:", err)
    }
}

init(getWebComponents)