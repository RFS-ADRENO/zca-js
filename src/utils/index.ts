import type cryptojs from "crypto-js";
import type { ContextBase, ContextSession } from "../context.js";
import { isContextSession } from "../context.js";
import { ZaloApiError } from "../Errors/index.js";
import { type API } from "../zalo.js";
import { logger } from "./common.js";
import { encodeAES } from "./crypto.js";
import { makeURL, request, resolveResponse } from "./http.js";

// Re-export common utilities
export * from "./common.js";
export * from "./crypto.js";
export * from "./file.js";
export * from "./http.js";

// API Factory using local imports
export type FactoryUtils<T> = {
    makeURL: (
        baseURL: string,
        params?: Record<string, string | number>,
        apiVersion?: boolean,
    ) => ReturnType<typeof makeURL>;
    encodeAES: (data: cryptojs.lib.WordArray | string, t?: number) => ReturnType<typeof encodeAES>;
    request: (url: string, options?: RequestInit, raw?: boolean) => ReturnType<typeof request>;
    logger: ReturnType<typeof logger>;
    resolve: (
        res: Response,
        cb?: (result: {
            data: unknown | null;
            error: {
                message: string;
                code?: number;
            } | null;
        }) => T,
        isEncrypted?: boolean,
    ) => ReturnType<typeof resolveResponse<T>>;
};

export function apiFactory<T>() {
    return <K extends (api: API, ctx: ContextSession, utils: FactoryUtils<T>) => unknown>(callback: K) => {
        return (ctx: ContextBase, api: API) => {
            if (!isContextSession(ctx)) throw new ZaloApiError("Invalid context " + JSON.stringify(ctx, null, 2));

            const utils = {
                makeURL(baseURL: string, params?: Record<string, string | number>, apiVersion?: boolean) {
                    return makeURL(ctx, baseURL, params, apiVersion);
                },
                encodeAES(data: cryptojs.lib.WordArray | string, t?: number) {
                    return encodeAES(ctx.secretKey, data, t);
                },
                request(url: string, options?: RequestInit, raw?: boolean) {
                    return request(ctx, url, options, raw);
                },
                logger: logger(ctx),
                resolve: (
                    res: Response,
                    cb?: (result: {
                        data: unknown | null;
                        error: {
                            message: string;
                            code?: number;
                        } | null;
                    }) => T,
                    isEncrypted?: boolean,
                ) => resolveResponse<T>(ctx, res, cb, isEncrypted),
            };

            return callback(api, ctx, utils) as ReturnType<K>;
        };
    };
}
