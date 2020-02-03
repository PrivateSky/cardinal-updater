const DEFAULT_SSAPP_NAME = "Cardinal-SSApp";

const GITHUB_BASE_PATH = "https://github.com/PrivateSky";
const GITHUB_BASE_PATH_LOCAL = "https://github.com/paiusCatalin";
const CARDINAL_MODULE_NAME = "cardinal";
const PSKWEBCOMPONENTS_MODULE_NAME = "pskwebcomponents";
const PSK_RELEASE_MODULE_NAME = "psk-release";

const DIRECTORIES_FOR_MKDIR = [
    "scripts",
    "themes",
    "cardinal",
    "scripts/privatesky"
];

const PATH_COPY_CARDINAL_FROM = [
    "../cardinal/release/cardinal/**/*",
    "../cardinal/release/scripts/app.js",
    "../cardinal/release/scripts/controllers/**/*",
    "../cardinal/release/themes/**/*",
    "../cardinal/release/cardinal.js"
];

const PATH_COPY_CARDINAL_TO = [
    "cardinal",
    "scripts",
    "scripts/controllers",
    "themes",
    "./",
];

const PATH_COPY_RELEASE_FROM = "../psk-release/psknode/bundles/**/*";
const PATH_COPY_RELEASE_TO = "scripts/privatesky";

const TEMPLATE_BASELINE_PATH = "template/baseline";
const INDEX_LEFT_MENU = "template/index/left-docked-menu/index.html";
const INDEX_TOP_MENU = "template/index/top-docked-menu/index.html";

module.exports = {
    DEFAULT_SSAPP_NAME,

    GITHUB_BASE_PATH,
    GITHUB_BASE_PATH_LOCAL,
    CARDINAL_MODULE_NAME,
    PSKWEBCOMPONENTS_MODULE_NAME,
    PSK_RELEASE_MODULE_NAME,

    DIRECTORIES_FOR_MKDIR,
    PATH_COPY_CARDINAL_FROM,
    PATH_COPY_CARDINAL_TO,

    PATH_COPY_RELEASE_TO,
    PATH_COPY_RELEASE_FROM,

    TEMPLATE_BASELINE_PATH,
    INDEX_LEFT_MENU,
    INDEX_TOP_MENU
}