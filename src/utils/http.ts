import toughCookie from "tough-cookie";
import { type ContextBase, type ContextSession } from "../context.js";
import { ZaloApiError } from "../Errors/index.js";
import { hasOwn, isBun, logger } from "./common.js";
import { decodeAES } from "./crypto.js";

/**
 *
 * @param baseURL
 * @param params
 * @param apiVersion automatically add zalo api version to url params
 * @returns
 *
 */
export function makeURL(
    ctx: ContextBase,
    baseURL: string,
    params: Record<string, string | number> = {},
    apiVersion: boolean = true,
) {
    const url = new URL(baseURL);
    for (const key in params) {
        if (hasOwn(params, key)) {
            url.searchParams.append(key, params[key].toString());
        }
    }

    if (apiVersion) {
        if (!url.searchParams.has("zpw_ver")) url.searchParams.set("zpw_ver", ctx.API_VERSION.toString());
        if (!url.searchParams.has("zpw_type")) url.searchParams.set("zpw_type", ctx.API_TYPE.toString());
    }

    return url.toString();
}

export async function getDefaultHeaders(ctx: ContextBase, origin: string = "https://chat.zalo.me") {
    if (!ctx.cookie) throw new ZaloApiError("Cookie is not available");
    if (!ctx.userAgent) throw new ZaloApiError("User agent is not available");

    return {
        Accept: "application/json, text/plain, */*",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "en-US,en;q=0.9",
        "content-type": "application/x-www-form-urlencoded",
        Cookie: await ctx.cookie.getCookieString(origin),
        Origin: "https://chat.zalo.me",
        Referer: "https://chat.zalo.me/",
        "User-Agent": ctx.userAgent,
    };
}

export async function request(ctx: ContextBase, url: string, options?: RequestInit, raw = false) {
    if (!ctx.cookie) ctx.cookie = new toughCookie.CookieJar();
    const origin = new URL(url).origin;

    const defaultHeaders = await getDefaultHeaders(ctx, origin);
    if (!raw) {
        if (options) {
            options.headers = Object.assign(defaultHeaders, options.headers || {});
        } else options = { headers: defaultHeaders };
    }

    const _options = {
        ...(options ?? {}),
        ...(isBun ? {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            proxy: ctx.options.agent?.proxy?.href
        } : { agent: ctx.options.agent }),
    };

    const response = await ctx.options.polyfill(url, _options);
    const setCookieRaw = response.headers.get("set-cookie");
    if (setCookieRaw && !raw) {
        const splitCookies = setCookieRaw.split(", ");
        for (const cookie of splitCookies) {
            const parsed = toughCookie.Cookie.parse(cookie);
            try {
                if (parsed) await ctx.cookie.setCookie(parsed, parsed.domain != "zalo.me" ? `https://${parsed.domain}` : origin);
            } catch (error: unknown) {
                logger(ctx).error(error);
            }
        }
    }

    const redirectURL = response.headers.get("location");
    if (redirectURL) {
        const redirectOptions = { ...options };
        redirectOptions.method = "GET";
        if (!raw) {
            redirectOptions.headers = new Headers(redirectOptions.headers);
            redirectOptions.headers.set("Referer", "https://id.zalo.me/");
        }
        return await request(ctx, redirectURL, redirectOptions);
    }

    return response;
}

type ZaloResponse<T> = {
    data: T | null;
    error: {
        message: string;
        code?: number;
    } | null;
};

export async function handleZaloResponse<T = unknown>(ctx: ContextSession, response: Response, isEncrypted = true) {
    const result: ZaloResponse<T> = {
        data: null,
        error: null,
    };

    if (!response.ok) {
        result.error = {
            message: "Request failed with status code " + response.status,
        };
        return result;
    }

    try {
        const jsonData: {
            error_code: number;
            error_message: string;
            data: string;
        } = await response.json();

        if (jsonData.error_code != 0) {
            result.error = {
                message: jsonData.error_message,
                code: jsonData.error_code,
            };
            return result;
        }

        const decodedData: {
            error_code: number;
            error_message: string;
            data: T;
        } = isEncrypted ? JSON.parse(decodeAES(ctx.secretKey!, jsonData.data)!) : jsonData;

        if (decodedData.error_code != 0) {
            result.error = {
                message: decodedData.error_message,
                code: decodedData.error_code,
            };
            return result;
        }

        result.data = decodedData.data;
    } catch (error) {
        logger(ctx).error("Failed to parse response data:", error);
        result.error = {
            message: "Failed to parse response data",
        };
    }

    return result;
}

export async function resolveResponse<T = unknown>(
    ctx: ContextSession,
    res: Response,
    cb?: (result: ZaloResponse<unknown>) => T,
    isEncrypted?: boolean,
) {
    const result = await handleZaloResponse<T>(ctx, res, isEncrypted);
    if (result.error) throw new ZaloApiError(result.error.message, result.error.code);
    if (cb) return cb(result);

    return result.data as T;
}
