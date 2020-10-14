const path           = require('path');
const nextBuild      = require('next/dist/build').default;
const packageManager = require('./packageManager');
const modulesUtils   = require('./modules');
const {isProd}       = require('./server');

/**
 * Compile the current theme
 */
const themeCompile = async (theme) => {
    try {
        theme = theme || global.envConfig.environment.currentTheme;
        theme = path.resolve(global.appRoot, 'themes', theme);
        await packageManager.execCmd(`yarn install ${isProd() ? ' --prod' : ''}`, `${theme}`);
        await nextBuild(theme);
    } catch (err) {
        console.error(err);
    }
};

/**
 * Set current theme at startup from envFile.currentTheme
 */
const loadTheme = async () => {
    await modulesUtils.createListModuleFile();
    await modulesUtils.displayListModule();

    // Language with i18n
    let i18nInstance = null;
    let ns           = null;
    try {
        const oI18n  = require(path.join(global.appRoot, 'themes', global.envConfig.environment.currentTheme, 'i18n'));
        i18nInstance = oI18n.i18nInstance;
        ns           = oI18n.ns;
    } catch (error) {
        console.error(error);
    }

    return {i18nInstance, ns};
};

module.exports = {
    themeCompile,
    loadTheme
};