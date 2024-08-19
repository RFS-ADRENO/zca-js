import { compare } from "semver";
import { logger } from "./utils.js";
import { appContext } from "./context.js";

const VERSION = "1.1.1";
const NPM_REGISTRY = "https://registry.npmjs.org/zca-js";

export async function checkUpdate() {
    if (!appContext.options.checkUpdate) return;
    const response = await fetch(NPM_REGISTRY).catch(() => null);
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
