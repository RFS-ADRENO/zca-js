'use strict';

var semver = require('semver');
var utils = require('./utils.cjs');

const VERSION = "2.0.0-beta.19";
const NPM_REGISTRY = "https://registry.npmjs.org/zca-js";
async function checkUpdate(ctx) {
    if (!ctx.options.checkUpdate)
        return;
    const _options = Object.assign({}, (utils.isBun ? { proxy: ctx.options.agent } : { agent: ctx.options.agent }));
    const response = await ctx.options.polyfill(NPM_REGISTRY, _options).catch(() => null);
    if (!response || !response.ok)
        return;
    const data = await response.json().catch(() => null);
    if (!data)
        return;
    const latestVersion = data["dist-tags"].latest;
    if (semver.compare(VERSION, latestVersion) === -1) {
        utils.logger(ctx).info(`A new version of zca-js is available: ${latestVersion}`);
    }
    else {
        utils.logger(ctx).info("zca-js is up to date");
    }
}

exports.checkUpdate = checkUpdate;
