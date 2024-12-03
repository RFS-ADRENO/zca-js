import { compare } from "semver";
import { appContext } from "./context.js";
import { isBun, logger } from "./utils.js";

const VERSION = "2.0.0-alpha.4";
const NPM_REGISTRY = "https://registry.npmjs.org/zca-js";

export async function checkUpdate() {
    if (!appContext.options.checkUpdate) return;

    const _options = {
        ...(isBun ? { proxy: appContext.options.agent } : { agent: appContext.options.agent }),
    };
    const response = await appContext.options.polyfill(NPM_REGISTRY, _options as RequestInit).catch(() => null);
    if (!response || !response.ok) return;

    const data = await response.json().catch(() => null);
    if (!data) return;

    const latestVersion = data["dist-tags"].latest;
    if (compare(VERSION, latestVersion) === -1) {
        logger.info(`A new version of zca-js is available: ${latestVersion}`);
    } else {
        logger.info("zca-js is up to date");
    }
}
