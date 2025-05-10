import { compare } from "semver";
import { isBun, logger } from "./utils.js";
const VERSION = "2.0.0-beta.19";
const NPM_REGISTRY = "https://registry.npmjs.org/zca-js";
export async function checkUpdate(ctx) {
    if (!ctx.options.checkUpdate)
        return;
    const _options = Object.assign({}, (isBun ? { proxy: ctx.options.agent } : { agent: ctx.options.agent }));
    const response = await ctx.options.polyfill(NPM_REGISTRY, _options).catch(() => null);
    if (!response || !response.ok)
        return;
    const data = await response.json().catch(() => null);
    if (!data)
        return;
    const latestVersion = data["dist-tags"].latest;
    if (compare(VERSION, latestVersion) === -1) {
        logger(ctx).info(`A new version of zca-js is available: ${latestVersion}`);
    }
    else {
        logger(ctx).info("zca-js is up to date");
    }
}
