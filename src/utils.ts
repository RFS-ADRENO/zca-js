import cryptojs from "crypto-js";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import pako from "pako";
import SparkMD5 from "spark-md5";
import toughCookie from "tough-cookie";
import JSONBig from "json-bigint";

import { isContextSession, type ContextSession, type ContextBase } from "./context.js";
import { ZaloApiError, ZaloApiMissingImageMetadataGetter } from "./Errors/index.js";
import { FriendEventType } from "./models/FriendEvent.js";
import { GroupEventType } from "./models/GroupEvent.js";
import type { API } from "./zalo.js";
import type { AttachmentSource } from "./models/Attachment.js";

export const isBun = typeof Bun !== "undefined";

export function hasOwn(obj: Record<string, unknown>, key: string): key is keyof typeof obj {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * Get signed key for API requests.
 *
 * @param type
 * @param params
 * @returns MD5 hash
 *
 */
export function getSignKey(type: string, params: Record<string, unknown>) {
    const n = [];
    for (const s in params) {
        if (hasOwn(params, s)) {
            n.push(s);
        }
    }

    n.sort();
    let a = "zsecure" + type;
    for (let s = 0; s < n.length; s++) a += params[n[s]];
    return cryptojs.MD5(a).toString();
}

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
            const n = cryptojs.MD5(this.zcid_ext).toString().toUpperCase();
            if (t(n, this.zcid) || !(e < 3)) return !1;
            this.createEncryptKey(e + 1);
        } catch {
            if (e < 3) this.createEncryptKey(e + 1);
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
            for (; s > 0; ) {
                e += Math.random()
                    .toString(16)
                    .substr(2, s > 12 ? 12 : s);
                s -= 12;
            }
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
        } catch {
            return s < 3 ? ParamsEncryptor.encodeAES(e, message, type, uppercase, s + 1) : null;
        }
    }
}

export function decryptResp(key: string, data: string): Record<string, unknown> | null | string {
    let n = null;
    try {
        n = decodeRespAES(key, data);
        const parsed = JSON.parse(n);
        return parsed;
    } catch {
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
    } catch {
        return null;
    }
}

export function encodeAES(secretKey: string, data: cryptojs.lib.WordArray | string, t = 0): string | null {
    try {
        const key = cryptojs.enc.Base64.parse(secretKey);
        return cryptojs.AES.encrypt(data, key, {
            iv: cryptojs.enc.Hex.parse("00000000000000000000000000000000"),
            mode: cryptojs.mode.CBC,
            padding: cryptojs.pad.Pkcs7,
        }).ciphertext.toString(cryptojs.enc.Base64);
    } catch {
        return t < 3 ? encodeAES(secretKey, data, t + 1) : null;
    }
}

export function decodeAES(secretKey: string, data: string, t = 0): string | null {
    try {
        data = decodeURIComponent(data);
        const key = cryptojs.enc.Base64.parse(secretKey);
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
    } catch {
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

export async function getImageMetaData(ctx: ContextBase, filePath: string) {
    if (!ctx.options.imageMetadataGetter) {
        throw new ZaloApiMissingImageMetadataGetter();
    }

    const imageData = await ctx.options.imageMetadataGetter(filePath);
    if (!imageData) {
        throw new ZaloApiError("Failed to get image metadata");
    }

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

export async function getGifMetaData(ctx: ContextBase, filePath: string) {
    if (!ctx.options.imageMetadataGetter) {
        throw new ZaloApiMissingImageMetadataGetter();
    }

    const gifData = await ctx.options.imageMetadataGetter(filePath);
    if (!gifData) {
        throw new ZaloApiError("Failed to get gif metadata");
    }

    const fileName = path.basename(filePath);

    return {
        fileName,
        totalSize: gifData.size,
        width: gifData.width,
        height: gifData.height,
    };
}

export async function decodeEventData(parsed: Record<string, unknown>, cipherKey?: string) {
    if (typeof parsed.data !== "string")
        throw new ZaloApiError(`Invalid data, expected string but got ${typeof parsed.data}`);
    if (typeof parsed.encrypt !== "number")
        throw new ZaloApiError(`Invalid encrypt type, expected number but got ${typeof parsed.encrypt}`);
    if (parsed.encrypt < 0 || parsed.encrypt > 3)
        throw new ZaloApiError(`Invalid encrypt type, expected 0-3 but got ${parsed.encrypt}`);

    const rawData = parsed.data;
    const encryptType = parsed.encrypt as 0 | 1 | 2 | 3;

    if (encryptType === 0) return JSON.parse(rawData);

    const decodedBuffer = decodeBase64ToBuffer(encryptType === 1 ? rawData : decodeURIComponent(rawData));

    let decryptedBuffer: ArrayBuffer | Buffer = decodedBuffer;
    if (encryptType !== 1) {
        if (cipherKey && decodedBuffer.length >= 48) {
            const algorithm = {
                name: "AES-GCM",
                iv: decodedBuffer.subarray(0, 16),
                tagLength: 128,
                additionalData: decodedBuffer.subarray(16, 32),
            };
            const dataSource = decodedBuffer.subarray(32);

            const cryptoKey = await crypto.subtle.importKey("raw", decodeBase64ToBuffer(cipherKey), algorithm, false, [
                "decrypt",
            ]);
            decryptedBuffer = await crypto.subtle.decrypt(algorithm, cryptoKey, dataSource);
        } else {
            throw new ZaloApiError("Invalid data length or missing cipher key");
        }
    }

    const decompressedBuffer =
        encryptType === 3 ? new Uint8Array(decryptedBuffer) : pako.inflate(decryptedBuffer as ArrayBuffer);
    const decodedData = decodeUnit8Array(decompressedBuffer);

    if (!decodedData) return;
    return JSONBig.parse(decodedData);
}

export async function getMd5LargeFileObject(source: AttachmentSource, fileSize: number) {
    const buffer = typeof source == "string" ? await fs.promises.readFile(source) : source.data;
    return new Promise<{
        currentChunk: number;
        data: string;
    }>((resolve) => {
        let currentChunk = 0;
        const chunkSize = 2097152, // Read in chunks of 2MB
            chunks = Math.ceil(fileSize / chunkSize),
            spark = new SparkMD5.ArrayBuffer();

        function loadNext() {
            const start = currentChunk * chunkSize,
                end = start + chunkSize >= fileSize ? fileSize : start + chunkSize;

            spark.append(new Uint8Array(buffer.subarray(start, end)).buffer as ArrayBuffer);
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

export const logger = (ctx: { options: { logging?: boolean } }) => ({
    verbose: (...args: unknown[]) => {
        if (ctx.options.logging) console.log("\x1b[35m🚀 VERBOSE\x1b[0m", ...args);
    },
    info: (...args: unknown[]) => {
        if (ctx.options.logging) console.log("\x1b[34mINFO\x1b[0m", ...args);
    },
    warn: (...args: unknown[]) => {
        if (ctx.options.logging) console.log("\x1b[33mWARN\x1b[0m", ...args);
    },
    error: (...args: unknown[]) => {
        if (ctx.options.logging) console.log("\x1b[31mERROR\x1b[0m", ...args);
    },
    success: (...args: unknown[]) => {
        if (ctx.options.logging) console.log("\x1b[32mSUCCESS\x1b[0m", ...args);
    },
    timestamp: (...args: unknown[]) => {
        const now = new Date().toISOString();
        if (ctx.options.logging) console.log(`\x1b[90m[${now}]\x1b[0m`, ...args);
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

export function strPadLeft(e: number | string, t: string, n: number) {
    const a = (e = "" + e).length;
    return a === n ? e : a > n ? e.slice(-n) : t.repeat(n - a) + e;
}

export function formatTime(format: string, timestamp: number = Date.now()): string {
    const date = new Date(timestamp);

    // using lib Intl
    const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        // hour12: false, // true or false is same <(")
    };

    const formatted = new Intl.DateTimeFormat("vi-VN", options).format(date);

    if (format.includes("%H") || format.includes("%d")) {
        return format
            .replace("%H", date.getHours().toString().padStart(2, "0"))
            .replace("%M", date.getMinutes().toString().padStart(2, "0"))
            .replace("%S", date.getSeconds().toString().padStart(2, "0"))
            .replace("%d", date.getDate().toString().padStart(2, "0"))
            .replace("%m", (date.getMonth() + 1).toString().padStart(2, "0"))
            .replace("%Y", date.getFullYear().toString());
    }

    return formatted;
}

export function getFullTimeFromMillisecond(e: number) {
    const t = new Date(e);
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

export function removeUndefinedKeys(e: Record<string, unknown>) {
    for (const t in e) if (e[t] === undefined) delete e[t];
    return e;
}

export function getGroupEventType(act: string) {
    if (act == "join_request") return GroupEventType.JOIN_REQUEST;
    if (act == "join") return GroupEventType.JOIN;
    if (act == "leave") return GroupEventType.LEAVE;
    if (act == "remove_member") return GroupEventType.REMOVE_MEMBER;
    if (act == "block_member") return GroupEventType.BLOCK_MEMBER;
    if (act == "update_setting") return GroupEventType.UPDATE_SETTING;
    if (act == "update_avatar") return GroupEventType.UPDATE_AVATAR;
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

export function getFriendEventType(act: string) {
    if (act == "add") return FriendEventType.ADD;
    if (act == "remove") return FriendEventType.REMOVE;
    if (act == "block") return FriendEventType.BLOCK;
    if (act == "unblock") return FriendEventType.UNBLOCK;
    if (act == "block_call") return FriendEventType.BLOCK_CALL;
    if (act == "unblock_call") return FriendEventType.UNBLOCK_CALL;

    if (act == "req_v2") return FriendEventType.REQUEST;
    if (act == "reject") return FriendEventType.REJECT_REQUEST;
    if (act == "undo_req") return FriendEventType.UNDO_REQUEST;

    if (act == "seen_fr_req") return FriendEventType.SEEN_FRIEND_REQUEST;

    if (act == "pin_unpin") return FriendEventType.PIN_UNPIN;
    if (act == "pin_create") return FriendEventType.PIN_CREATE;

    return FriendEventType.UNKNOWN;
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
        cb?: (result: ZaloResponse<unknown>) => T,
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
                resolve: (res: Response, cb?: (result: ZaloResponse<unknown>) => T, isEncrypted?: boolean) =>
                    resolveResponse<T>(ctx, res, cb, isEncrypted),
            };

            return callback(api, ctx, utils) as ReturnType<K>;
        };
    };
}

export function generateZaloUUID(userAgent: string) {
    return crypto.randomUUID() + "-" + cryptojs.MD5(userAgent).toString();
}

/**
 * Encrypts a 4-digit PIN to a 32-character hex string
 * @param pin 4-digit PIN number
 * @returns 32-character hex string
 */
export function encryptPin(pin: string): string {
    return crypto.createHash("md5").update(pin).digest("hex");
}

/**
 * Decrypts a 32-character hex string back to 4-digit PIN
 * Note: This is a one-way hash, so we can only verify if a PIN matches the hash
 * @param encryptedPin 32-character hex string
 * @param pin 4-digit PIN to verify
 * @returns true if the PIN matches the hash
 *
 * @example
 * const encryptedPin = (await api.getHiddenConversations()).pin;
 * checking pin created..
 * const isValid = validatePin(encryptedPin, "1234"); // true if pin created is 1234
 * const isInvalid = validatePin(encryptedPin, "5678"); // false if not pin created is 5678
 */
export function validatePin(encryptedPin: string, pin: string): boolean {
    const hash = crypto.createHash("md5").update(pin).digest("hex");
    return hash === encryptedPin;
}

/**
 * Converts a hex color code to a negative color number used by Zalo API
 * @param hex Hex color code (e.g. '#00FF00' or '00FF00')
 * @returns Negative color number (e.g. -16711936)
 *
 * @example
 * const negativeColor = hexToNegativeColor('#00FF00'); // Result: -16711936
 */
export function hexToNegativeColor(hex: string): number {
    if (!hex.startsWith("#")) {
        hex = "#" + hex;
    }

    // rgb no alpha
    // const decimal = parseInt(hex.slice(1), 16);
    // return decimal - 4294967296;

    // rgb with alpha
    let hexValue = hex.slice(1);
    if (hexValue.length === 6) {
        hexValue = "FF" + hexValue;
    }
    const decimal = parseInt(hexValue, 16);
    return decimal > 0x7fffffff ? decimal - 4294967296 : decimal;
}

/**
 * Converts a negative color number from Zalo API to hex color code
 * @param negativeColor Negative color number (e.g. -16711936)
 * @returns Hex color code (e.g. '#00FF00')
 *
 * @example
 * const hexColor = negativeColorToHex(-16711936); // Result: '#00FF00'
 */
export function negativeColorToHex(negativeColor: number): string {
    // Add 2^32 to get positive number
    const positiveColor = negativeColor + 4294967296;

    // return "#" + positiveColor.toString(16).padStart(6, "0"); // rgb no alpha
    return "#" + positiveColor.toString(16).slice(-6).padStart(6, "0"); // rgb with alpha
}
