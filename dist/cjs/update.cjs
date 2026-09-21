'use strict';

var semver = require('semver');
var utils = require('./utils.cjs');

const VERSION = "2.2.0";
const NPM_REGISTRY = "https://registry.npmjs.org/zca-js";
async function checkUpdate(ctx) {
    var _a, _b;
    if (!ctx.options.checkUpdate)
        return;
    const _options = Object.assign({}, (utils.isBun
        ? {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            proxy: (_b = (_a = ctx.options.agent) === null || _a === void 0 ? void 0 : _a.proxy) === null || _b === void 0 ? void 0 : _b.href,
        }
        : { agent: ctx.options.agent }));
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
