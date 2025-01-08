import cryptojs from "crypto-js";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import pako from "pako";
import sharp from "sharp";
import SparkMD5 from "spark-md5";
import toughCookie from "tough-cookie";

import { isContextSession, type ContextSession, type ContextBase } from "./context.js";
import { ZaloApiError } from "./Errors/ZaloApiError.js";
import { GroupEventType } from "./models/GroupEvent.js";
import type { API } from "./zalo.js";

export const isBun = typeof Bun !== "undefined";

/**
 * Get signed key for API requests.
 *
 * @param type
 * @param params
 * @returns MD5 hash
 *
 */
export function getSignKey(type: string, params: Record<string, any>) {
    let n = [];
    for (let s in params) {
        if (params.hasOwnProperty(s)) {
            n.push(s);
        }
    }

    n.sort();
    let a = "zsecure" + type;
    for (let s = 0; s < n.length; s++) a += params[n[s]];
    return cryptojs.MD5(a);
}

/**
 *
 * @param baseURL
 * @param params
 * @param apiVersion automatically add zalo api version to url params
 * @returns
 */
export function makeURL(
    ctx: ContextBase,
    baseURL: string,
    params: Record<string, any> = {},
    apiVersion: boolean = true,
) {
    let url = new URL(baseURL);
    for (let key in params) {
        if (params.hasOwnProperty(key)) {
            url.searchParams.append(key, params[key]);
        }
    }

    if (apiVersion) {
        if (!url.searchParams.has("zpw_ver")) url.searchParams.set("zpw_ver", ctx.API_VERSION.toString());
        if (!url.searchParams.has("zpw_type")) url.searchParams.set("zpw_type", ctx.API_TYPE.toString());
    }

    return url.toString();
}

export class ParamsEncryptor {
    private zcid: string | null = null;
    private enc_ver: string;
    private zcid_ext: string;
    private encryptKey: string | null;
    constructor({ type, imei, firstLaunchTime }: { type: number; imei: string; firstLaunchTime: number }) {
        this.enc_ver = "v2";
        this.zcid = null;
        this.encryptKey = null;

        this.createZcid(type, imei, firstLaunchTime);
        this.zcid_ext = ParamsEncryptor.randomString();
        this.createEncryptKey();
    }

    getEncryptKey() {
        if (!this.encryptKey) throw new ZaloApiError("getEncryptKey: didn't create encryptKey yet");
        return this.encryptKey;
    }

    createZcid(type: number, imei: string, firstLaunchTime: number) {
        if (!type || !imei || !firstLaunchTime) throw new ZaloApiError("createZcid: missing params");
        const msg = `${type},${imei},${firstLaunchTime}`;
        const s = ParamsEncryptor.encodeAES("3FC4F0D2AB50057BCE0D90D9187A22B1", msg, "hex", true);
        this.zcid = s;
    }

    createEncryptKey(e = 0) {
        const t = (e: string, t: string) => {
            const { even: n } = ParamsEncryptor.processStr(e),
                { even: a, odd: s } = ParamsEncryptor.processStr(t);
            if (!n || !a || !s) return !1;
            const i = n.slice(0, 8).join("") + a.slice(0, 12).join("") + s.reverse().slice(0, 12).join("");
            return (this.encryptKey = i), !0;
        };
        if (!this.zcid || !this.zcid_ext) throw new ZaloApiError("createEncryptKey: zcid or zcid_ext is null");
        try {
            let n = cryptojs.MD5(this.zcid_ext).toString().toUpperCase();
            if (t(n, this.zcid) || !(e < 3)) return !1;
            this.createEncryptKey(e + 1);
        } catch (n) {
            e < 3 && this.createEncryptKey(e + 1);
        }
        return !0;
    }

    getParams() {
        return this.zcid
            ? {
                  zcid: this.zcid,
                  zcid_ext: this.zcid_ext,
                  enc_ver: this.enc_ver,
              }
            : null;
    }

    static processStr(e: string) {
        if (!e || "string" != typeof e)
            return {
                even: null,
                odd: null,
            };
        const [t, n] = [...e].reduce((e, t, n) => (e[n % 2].push(t), e), [[], []] as string[][]);
        return {
            even: t,
            odd: n,
        };
    }

    static randomString(e?: number, t?: number) {
        const n = e || 6,
            a = t && e && t > e ? t : 12;
        let s = Math.floor(Math.random() * (a - n + 1)) + n;
        if (s > 12) {
            let e = "";
            for (; s > 0; )
                (e += Math.random()
                    .toString(16)
                    .substr(2, s > 12 ? 12 : s)),
                    (s -= 12);
            return e;
        }
        return Math.random().toString(16).substr(2, s);
    }

    static encodeAES(e: string, message: string, type: "hex" | "base64", uppercase: boolean, s = 0): string | null {
        if (!message) return null;
        try {
            {
                const encoder = "hex" == type ? cryptojs.enc.Hex : cryptojs.enc.Base64;
                const key = cryptojs.enc.Utf8.parse(e);

                const cfg = {
                    words: [0, 0, 0, 0],
                    sigBytes: 16,
                } as cryptojs.lib.WordArray;
                const encrypted = cryptojs.AES.encrypt(message, key, {
                    iv: cfg,
                    mode: cryptojs.mode.CBC,
                    padding: cryptojs.pad.Pkcs7,
                }).ciphertext.toString(encoder);

                return uppercase ? encrypted.toUpperCase() : encrypted;
            }
        } catch (o) {
            return s < 3 ? ParamsEncryptor.encodeAES(e, message, type, uppercase, s + 1) : null;
        }
    }
}

export function decryptResp(key: string, data: string): Record<string, any> | null | string {
    let n = null;
    try {
        n = decodeRespAES(key, data);
        const parsed = JSON.parse(n);
        return parsed;
    } catch (error) {
        return n;
    }
}

function decodeRespAES(key: string, data: string) {
    data = decodeURIComponent(data);
    const parsedKey = cryptojs.enc.Utf8.parse(key);
    const n = {
        words: [0, 0, 0, 0],
        sigBytes: 16,
    } as cryptojs.lib.WordArray;

    return cryptojs.AES.decrypt(
        {
            ciphertext: cryptojs.enc.Base64.parse(data),
        } as cryptojs.lib.CipherParams,
        parsedKey,
        {
            iv: n,
            mode: cryptojs.mode.CBC,
            padding: cryptojs.pad.Pkcs7,
        },
    ).toString(cryptojs.enc.Utf8);
}

export function decodeBase64ToBuffer(data: string) {
    return Buffer.from(data, "base64");
}

export function decodeUnit8Array(data: Uint8Array) {
    try {
        return new TextDecoder().decode(data);
    } catch (error) {
        return null;
    }
}

export function encodeAES(secretKey: string, data: any, t = 0): string | null {
    try {
        const key = cryptojs.enc.Base64.parse(secretKey);
        return cryptojs.AES.encrypt(data, key, {
            iv: cryptojs.enc.Hex.parse("00000000000000000000000000000000"),
            mode: cryptojs.mode.CBC,
            padding: cryptojs.pad.Pkcs7,
        }).ciphertext.toString(cryptojs.enc.Base64);
    } catch (n) {
        return t < 3 ? encodeAES(secretKey, data, t + 1) : null;
    }
}

export function decodeAES(secretKey: string, data: string, t = 0): string | null {
    try {
        data = decodeURIComponent(data);
        let key = cryptojs.enc.Base64.parse(secretKey);
        return cryptojs.AES.decrypt(
            {
                ciphertext: cryptojs.enc.Base64.parse(data),
            } as cryptojs.lib.CipherParams,
            key,
            {
                iv: cryptojs.enc.Hex.parse("00000000000000000000000000000000"),
                mode: cryptojs.mode.CBC,
                padding: cryptojs.pad.Pkcs7,
            },
        ).toString(cryptojs.enc.Utf8);
    } catch (n) {
        return t < 3 ? decodeAES(secretKey, data, t + 1) : null;
    }
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
        // @ts-ignore
        ...(isBun ? { proxy: ctx.options.agent } : { agent: ctx.options.agent }),
    };

    const response = await ctx.options.polyfill(url, _options);
    if (response.headers.has("set-cookie") && !raw) {
        for (const cookie of response.headers.getSetCookie()) {
            const parsed = toughCookie.Cookie.parse(cookie);
            try {
                if (parsed) await ctx.cookie.setCookie(parsed, origin);
            } catch {}
        }
    }

    const redirectURL = response.headers.get("location");
    if (redirectURL) {
        const redirectOptions = { ...options };
        redirectOptions.method = "GET";
        // @ts-ignore
        if (!raw) redirectOptions.headers["Referer"] = "https://id.zalo.me/";
        return await request(ctx, redirectURL, redirectOptions);
    }

    return response;
}

export async function getImageMetaData(filePath: string) {
    const fileData = await fs.promises.readFile(filePath);
    const imageData = await sharp(fileData).metadata();
    const fileName = filePath.split("/").pop()!;

    return {
        fileName,
        totalSize: imageData.size,
        width: imageData.width,
        height: imageData.height,
    };
}

export async function getFileSize(filePath: string) {
    return fs.promises.stat(filePath).then((s) => s.size);
}

export async function getGifMetaData(filePath: string) {
    const fileData = await fs.promises.readFile(filePath);
    const gifData = await sharp(fileData).metadata();
    const fileName = path.basename(filePath);

    return {
        fileName,
        totalSize: gifData.size,
        width: gifData.width,
        height: gifData.height,
    };
}

export async function decodeEventData(parsed: any, cipherKey?: string) {
    if (!cipherKey) return;

    const eventData = parsed.data;
    const decodedEventDataBuffer = decodeBase64ToBuffer(decodeURIComponent(eventData));

    if (decodedEventDataBuffer.length >= 48) {
        const algorithm = {
            name: "AES-GCM",
            iv: decodedEventDataBuffer.subarray(0, 16),
            tagLength: 128,
            additionalData: decodedEventDataBuffer.subarray(16, 32),
        };
        const dataSource = decodedEventDataBuffer.subarray(32);

        const cryptoKey = await crypto.subtle.importKey("raw", decodeBase64ToBuffer(cipherKey), algorithm, false, [
            "decrypt",
        ]);
        const decryptedData = await crypto.subtle.decrypt(algorithm, cryptoKey, dataSource);
        const decompressedData = pako.inflate(decryptedData);
        const decodedData = decodeUnit8Array(decompressedData);

        if (!decodedData) return;
        return JSON.parse(decodedData);
    }
}

export function getMd5LargeFileObject(filePath: string, fileSize: number) {
    return new Promise<{
        currentChunk: number;
        data: string;
    }>(async (resolve, reject) => {
        let chunkSize = 2097152, // Read in chunks of 2MB
            chunks = Math.ceil(fileSize / chunkSize),
            currentChunk = 0,
            spark = new SparkMD5.ArrayBuffer(),
            buffer = await fs.promises.readFile(filePath);

        function loadNext() {
            let start = currentChunk * chunkSize,
                end = start + chunkSize >= fileSize ? fileSize : start + chunkSize;

            // @ts-ignore
            spark.append(buffer.subarray(start, end));
            currentChunk++;

            if (currentChunk < chunks) {
                loadNext();
            } else {
                resolve({
                    currentChunk,
                    data: spark.end(),
                });
            }
        }

        loadNext();
    });
}

export const logger = (ctx: ContextBase) => ({
    verbose: (...args: any[]) => {
        if (ctx.options.logging) console.log("\x1b[2m🚀 VERBOSE\x1b[0m", ...args);
    },
    info: (...args: any[]) => {
        if (ctx.options.logging) console.log("\x1b[34mINFO\x1b[0m", ...args);
    },
    warn: (...args: any[]) => {
        if (ctx.options.logging) console.log("\x1b[33mWARN\x1b[0m", ...args);
    },
    error: (...args: any[]) => {
        if (ctx.options.logging) console.log("\x1b[31mERROR\x1b[0m", ...args);
    },
});

export function getClientMessageType(msgType: string) {
    if (msgType === "webchat") return 1;
    if (msgType === "chat.voice") return 31;
    if (msgType === "chat.photo") return 32;
    if (msgType === "chat.sticker") return 36;
    if (msgType === "chat.doodle") return 37;
    if (msgType === "chat.recommended") return 38;

    if (msgType === "chat.link") return 38; // don't know || if (msgType === "chat.link") return 1;
    if (msgType === "chat.video.msg") return 44; // not sure

    if (msgType === "share.file") return 46;
    if (msgType === "chat.gif") return 49;
    if (msgType === "chat.location.new") return 43;

    return 1;
}

export function strPadLeft(e: any, t: string, n: number) {
    const a = (e = "" + e).length;
    return a === n ? e : a > n ? e.slice(-n) : t.repeat(n - a) + e;
}

export function getFullTimeFromMillisecond(e: number) {
    let t = new Date(e);
    return (
        strPadLeft(t.getHours(), "0", 2) +
        ":" +
        strPadLeft(t.getMinutes(), "0", 2) +
        " " +
        strPadLeft(t.getDate(), "0", 2) +
        "/" +
        strPadLeft(t.getMonth() + 1, "0", 2) +
        "/" +
        t.getFullYear()
    );
}

export function getFileExtension(e: string) {
    return path.extname(e).slice(1);
}

export function getFileName(e: string) {
    return path.basename(e);
}

export function removeUndefinedKeys(e: Record<string, any>) {
    for (let t in e) e[t] === undefined && delete e[t];
    return e;
}

export function getGroupEventType(act: string) {
    if (act == "join_request") return GroupEventType.JOIN_REQUEST;
    if (act == "join") return GroupEventType.JOIN;
    if (act == "leave") return GroupEventType.LEAVE;
    if (act == "remove_member") return GroupEventType.REMOVE_MEMBER;
    if (act == "block_member") return GroupEventType.BLOCK_MEMBER;
    if (act == "update_setting") return GroupEventType.UPDATE_SETTING;
    if (act == "update") return GroupEventType.UPDATE;
    if (act == "new_link") return GroupEventType.NEW_LINK;
    if (act == "add_admin") return GroupEventType.ADD_ADMIN;
    if (act == "remove_admin") return GroupEventType.REMOVE_ADMIN;

    if (act == "new_pin_topic") return GroupEventType.NEW_PIN_TOPIC;
    if (act == "update_pin_topic") return GroupEventType.UPDATE_PIN_TOPIC;
    if (act == "update_topic") return GroupEventType.UPDATE_TOPIC;
    if (act == "update_board") return GroupEventType.UPDATE_BOARD;
    if (act == "remove_board") return GroupEventType.REMOVE_BOARD;
    if (act == "reorder_pin_topic") return GroupEventType.REORDER_PIN_TOPIC;
    if (act == "unpin_topic") return GroupEventType.UNPIN_TOPIC;
    if (act == "remove_topic") return GroupEventType.REMOVE_TOPIC;
    if (act == "accept_remind") return GroupEventType.ACCEPT_REMIND;
    if (act == "reject_remind") return GroupEventType.REJECT_REMIND;
    if (act == "remind_topic") return GroupEventType.REMIND_TOPIC;

    return GroupEventType.UNKNOWN;
}

type ZaloResponse<T> = {
    data: T | null;
    error: {
        message: string;
        code?: number;
    } | null;
};

export async function handleZaloResponse<T = any>(ctx: ContextSession, response: Response) {
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
        } = JSON.parse(decodeAES(ctx.secretKey!, jsonData.data)!);

        if (decodedData.error_code != 0) {
            result.error = {
                message: decodedData.error_message,
                code: decodedData.error_code,
            };
            return result;
        }

        result.data = decodedData.data;
    } catch (error) {
        console.error(error);
        result.error = {
            message: "Failed to parse response data",
        };
    }

    return result;
}

export async function resolveResponse<T = any>(
    ctx: ContextSession,
    res: Response,
    cb?: (result: ZaloResponse<unknown>) => T,
) {
    const result = await handleZaloResponse<T>(ctx, res);
    if (result.error) throw new ZaloApiError(result.error.message, result.error.code);
    if (cb) return cb(result);

    return result.data as T;
}

export function apiFactory<T>() {
    return <
        K extends (
            api: API,
            ctx: ContextSession,
            utils: {
                makeURL: (
                    baseURL: string,
                    params?: Record<string, any>,
                    apiVersion?: boolean,
                ) => ReturnType<typeof makeURL>;
                encodeAES: (data: any, t?: number) => ReturnType<typeof encodeAES>;
                request: (url: string, options?: RequestInit, raw?: boolean) => ReturnType<typeof request>;
                logger: ReturnType<typeof logger>;
                resolve: (
                    res: Response,
                    cb?: (result: ZaloResponse<unknown>) => T,
                ) => ReturnType<typeof resolveResponse<T>>;
            },
        ) => any,
    >(
        callback: K,
    ) => {
        return (ctx: ContextBase, api: API) => {
            if (!isContextSession(ctx)) throw new ZaloApiError("Invalid context " + JSON.stringify(ctx, null, 2));

            const utils = {
                makeURL(baseURL: string, params?: Record<string, any>, apiVersion?: boolean) {
                    return makeURL(ctx, baseURL, params, apiVersion);
                },
                encodeAES(data: any, t?: number) {
                    return encodeAES(ctx.secretKey, data, t);
                },
                request(url: string, options?: RequestInit, raw?: boolean) {
                    return request(ctx, url, options, raw);
                },
                logger: logger(ctx),
                resolve: (res: Response, cb?: (result: ZaloResponse<unknown>) => T) => resolveResponse<T>(ctx, res, cb),
            };

            return callback(api, ctx, utils) as ReturnType<K>;
        };
    };
}

export function generateZaloUUID(userAgent: string) {
    return crypto.randomUUID() + "-" + cryptojs.MD5(userAgent).toString();
}
