import type { ContextBase } from "./context.js";
import { logger, request } from "./utils.js";

export type ApiVersionInfo = {
    apiType: number;
    apiVersion: number;
};

const ZALO_WEB_URL = "https://chat.zalo.me/";

const SEC_CH_HEADERS = {
    "accept-language": "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
    "sec-ch-ua": '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
};

/**
 * Script file names are content-hashed, so a bundle URL always maps to the same version.
 * Caching by URL avoids downloading the (large) bundle again for every login in the same process.
 */
const bundleCache = new Map<string, ApiVersionInfo>();

async function loadZaloWebPage(ctx: ContextBase) {
    const response = await request(ctx, ZALO_WEB_URL, {
        headers: {
            ...SEC_CH_HEADERS,
            accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "cache-control": "max-age=0",
            priority: "u=0, i",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "none",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
        },
        method: "GET",
    });
    if (!response.ok) return null;

    return await response.text();
}

async function loadScript(ctx: ContextBase, url: string) {
    const response = await request(ctx, url, {
        headers: {
            ...SEC_CH_HEADERS,
            accept: "*/*",
            "sec-fetch-dest": "script",
            "sec-fetch-mode": "no-cors",
            "sec-fetch-site": "cross-site",
        },
        method: "GET",
    });
    if (!response.ok) return null;

    return await response.text();
}

function getScriptUrls(html: string) {
    const urls: string[] = [];
    const regex = /<script[^>]+src=["']([^"']+\.js)["']/g;

    let match: RegExpExecArray | null;
    while ((match = regex.exec(html)) !== null) {
        try {
            const url = new URL(match[1], ZALO_WEB_URL);
            if (url.hostname.startsWith("zalo-chat-static.")) urls.push(url.href);
        } catch {
            // ignore malformed urls
        }
    }

    // the app config currently lives in default-embed-render.<hash>.js, try it first
    const isConfigBundle = (url: string) => /\/default-embed-render\.[0-9a-f]+\.js$/.test(url);
    return [...urls.filter(isConfigBundle), ...urls.filter((url) => !isConfigBundle(url))];
}

/**
 * Looks for `apiVersion:695,apiType:"embed"===__ZaBUNDLENAME__?31:30` in the bundle
 */
function parseScript(script: string, bundleName: string): ApiVersionInfo | null {
    const versionMatch = script.match(/\bapiVersion:(\d+)/);
    const typeMatch = script.match(/\bapiType:(?:"embed"===__ZaBUNDLENAME__\?(\d+):(\d+)|(\d+))/);
    if (!versionMatch || !typeMatch) return null;

    const [, embedType, defaultType, literalType] = typeMatch;
    const apiType = Number(literalType ?? (bundleName.toLowerCase() == "embed" ? embedType : defaultType));
    const apiVersion = Number(versionMatch[1]);

    if (!Number.isInteger(apiType) || !Number.isInteger(apiVersion) || apiType <= 0 || apiVersion <= 0) return null;

    return { apiType, apiVersion };
}

/**
 * Detect the API type and version currently used by Zalo Web,
 * by loading the web page (using the cookie jar of `ctx`) and reading its app config.
 *
 * @returns `null` if it cannot be detected, this function never throws
 */
export async function fetchApiVersion(ctx: ContextBase): Promise<ApiVersionInfo | null> {
    try {
        const html = await loadZaloWebPage(ctx);
        if (!html) return null;

        const bundleName = html.match(/__ZaBUNDLENAME__\s*=\s*['"](\w+)['"]/)?.[1] ?? "WEB";
        const scriptUrls = getScriptUrls(html);

        for (const url of scriptUrls) {
            const cached = bundleCache.get(url);
            if (cached) return cached;
        }

        for (const url of scriptUrls) {
            const script = await loadScript(ctx, url).catch(() => null);
            if (!script) continue;

            const result = parseScript(script, bundleName);
            if (result) {
                bundleCache.set(url, result);
                return result;
            }
        }

        return null;
    } catch (error) {
        logger(ctx).verbose("Failed to detect Zalo API version:", error);
        return null;
    }
}
