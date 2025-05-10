import cryptojs from "crypto-js";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import pako from "pako";
import sharp from "sharp";
import SparkMD5 from "spark-md5";
import toughCookie from "tough-cookie";
import { isContextSession } from "./context.js";
import { ZaloApiError } from "./Errors/ZaloApiError.js";
import { GroupEventType } from "./models/GroupEvent.js";
import { FriendEventType } from "./models/FriendEvent.js";
export const isBun = typeof Bun !== "undefined";
/**
 * Get signed key for API requests.
 *
 * @param type
 * @param params
 * @returns MD5 hash
 *
 */
export function getSignKey(type, params) {
    let n = [];
    for (let s in params) {
        if (params.hasOwnProperty(s)) {
            n.push(s);
        }
    }
    n.sort();
    let a = "zsecure" + type;
    for (let s = 0; s < n.length; s++)
        a += params[n[s]];
    return cryptojs.MD5(a);
}
/**
 *
 * @param baseURL
 * @param params
 * @param apiVersion automatically add zalo api version to url params
 * @returns
 *
 */
export function makeURL(ctx, baseURL, params = {}, apiVersion = true) {
    let url = new URL(baseURL);
    for (let key in params) {
        if (params.hasOwnProperty(key)) {
            url.searchParams.append(key, params[key]);
        }
    }
    if (apiVersion) {
        if (!url.searchParams.has("zpw_ver"))
            url.searchParams.set("zpw_ver", ctx.API_VERSION.toString());
        if (!url.searchParams.has("zpw_type"))
            url.searchParams.set("zpw_type", ctx.API_TYPE.toString());
    }
    return url.toString();
}
export class ParamsEncryptor {
    constructor({ type, imei, firstLaunchTime }) {
        this.zcid = null;
        this.enc_ver = "v2";
        this.zcid = null;
        this.encryptKey = null;
        this.createZcid(type, imei, firstLaunchTime);
        this.zcid_ext = ParamsEncryptor.randomString();
        this.createEncryptKey();
    }
    getEncryptKey() {
        if (!this.encryptKey)
            throw new ZaloApiError("getEncryptKey: didn't create encryptKey yet");
        return this.encryptKey;
    }
    createZcid(type, imei, firstLaunchTime) {
        if (!type || !imei || !firstLaunchTime)
            throw new ZaloApiError("createZcid: missing params");
        const msg = `${type},${imei},${firstLaunchTime}`;
        const s = ParamsEncryptor.encodeAES("3FC4F0D2AB50057BCE0D90D9187A22B1", msg, "hex", true);
        this.zcid = s;
    }
    createEncryptKey(e = 0) {
        const t = (e, t) => {
            const { even: n } = ParamsEncryptor.processStr(e), { even: a, odd: s } = ParamsEncryptor.processStr(t);
            if (!n || !a || !s)
                return !1;
            const i = n.slice(0, 8).join("") + a.slice(0, 12).join("") + s.reverse().slice(0, 12).join("");
            return (this.encryptKey = i), !0;
        };
        if (!this.zcid || !this.zcid_ext)
            throw new ZaloApiError("createEncryptKey: zcid or zcid_ext is null");
        try {
            let n = cryptojs.MD5(this.zcid_ext).toString().toUpperCase();
            if (t(n, this.zcid) || !(e < 3))
                return !1;
            this.createEncryptKey(e + 1);
        }
        catch (n) {
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
    static processStr(e) {
        if (!e || "string" != typeof e)
            return {
                even: null,
                odd: null,
            };
        const [t, n] = [...e].reduce((e, t, n) => (e[n % 2].push(t), e), [[], []]);
        return {
            even: t,
            odd: n,
        };
    }
    static randomString(e, t) {
        const n = e || 6, a = t && e && t > e ? t : 12;
        let s = Math.floor(Math.random() * (a - n + 1)) + n;
        if (s > 12) {
            let e = "";
            for (; s > 0;)
                (e += Math.random()
                    .toString(16)
                    .substr(2, s > 12 ? 12 : s)),
                    (s -= 12);
            return e;
        }
        return Math.random().toString(16).substr(2, s);
    }
    static encodeAES(e, message, type, uppercase, s = 0) {
        if (!message)
            return null;
        try {
            {
                const encoder = "hex" == type ? cryptojs.enc.Hex : cryptojs.enc.Base64;
                const key = cryptojs.enc.Utf8.parse(e);
                const cfg = {
                    words: [0, 0, 0, 0],
                    sigBytes: 16,
                };
                const encrypted = cryptojs.AES.encrypt(message, key, {
                    iv: cfg,
                    mode: cryptojs.mode.CBC,
                    padding: cryptojs.pad.Pkcs7,
                }).ciphertext.toString(encoder);
                return uppercase ? encrypted.toUpperCase() : encrypted;
            }
        }
        catch (o) {
            return s < 3 ? ParamsEncryptor.encodeAES(e, message, type, uppercase, s + 1) : null;
        }
    }
}
export function decryptResp(key, data) {
    let n = null;
    try {
        n = decodeRespAES(key, data);
        const parsed = JSON.parse(n);
        return parsed;
    }
    catch (error) {
        return n;
    }
}
function decodeRespAES(key, data) {
    data = decodeURIComponent(data);
    const parsedKey = cryptojs.enc.Utf8.parse(key);
    const n = {
        words: [0, 0, 0, 0],
        sigBytes: 16,
    };
    return cryptojs.AES.decrypt({
        ciphertext: cryptojs.enc.Base64.parse(data),
    }, parsedKey, {
        iv: n,
        mode: cryptojs.mode.CBC,
        padding: cryptojs.pad.Pkcs7,
    }).toString(cryptojs.enc.Utf8);
}
export function decodeBase64ToBuffer(data) {
    return Buffer.from(data, "base64");
}
export function decodeUnit8Array(data) {
    try {
        return new TextDecoder().decode(data);
    }
    catch (error) {
        return null;
    }
}
export function encodeAES(secretKey, data, t = 0) {
    try {
        const key = cryptojs.enc.Base64.parse(secretKey);
        return cryptojs.AES.encrypt(data, key, {
            iv: cryptojs.enc.Hex.parse("00000000000000000000000000000000"),
            mode: cryptojs.mode.CBC,
            padding: cryptojs.pad.Pkcs7,
        }).ciphertext.toString(cryptojs.enc.Base64);
    }
    catch (n) {
        return t < 3 ? encodeAES(secretKey, data, t + 1) : null;
    }
}
export function decodeAES(secretKey, data, t = 0) {
    try {
        data = decodeURIComponent(data);
        let key = cryptojs.enc.Base64.parse(secretKey);
        return cryptojs.AES.decrypt({
            ciphertext: cryptojs.enc.Base64.parse(data),
        }, key, {
            iv: cryptojs.enc.Hex.parse("00000000000000000000000000000000"),
            mode: cryptojs.mode.CBC,
            padding: cryptojs.pad.Pkcs7,
        }).toString(cryptojs.enc.Utf8);
    }
    catch (n) {
        return t < 3 ? decodeAES(secretKey, data, t + 1) : null;
    }
}
export async function getDefaultHeaders(ctx, origin = "https://chat.zalo.me") {
    if (!ctx.cookie)
        throw new ZaloApiError("Cookie is not available");
    if (!ctx.userAgent)
        throw new ZaloApiError("User agent is not available");
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
export async function request(ctx, url, options, raw = false) {
    if (!ctx.cookie)
        ctx.cookie = new toughCookie.CookieJar();
    const origin = new URL(url).origin;
    const defaultHeaders = await getDefaultHeaders(ctx, origin);
    if (!raw) {
        if (options) {
            options.headers = Object.assign(defaultHeaders, options.headers || {});
        }
        else
            options = { headers: defaultHeaders };
    }
    const _options = Object.assign(Object.assign({}, (options !== null && options !== void 0 ? options : {})), (isBun ? { proxy: ctx.options.agent } : { agent: ctx.options.agent }));
    const response = await ctx.options.polyfill(url, _options);
    const setCookieRaw = response.headers.get("set-cookie");
    if (setCookieRaw && !raw) {
        const splitCookies = setCookieRaw.split(", ");
        for (const cookie of splitCookies) {
            const parsed = toughCookie.Cookie.parse(cookie);
            try {
                if (parsed)
                    await ctx.cookie.setCookie(parsed, origin);
            }
            catch (_a) { }
        }
    }
    const redirectURL = response.headers.get("location");
    if (redirectURL) {
        const redirectOptions = Object.assign({}, options);
        redirectOptions.method = "GET";
        // @ts-ignore
        if (!raw)
            redirectOptions.headers["Referer"] = "https://id.zalo.me/";
        return await request(ctx, redirectURL, redirectOptions);
    }
    return response;
}
export async function getImageMetaData(filePath) {
    const fileData = await fs.promises.readFile(filePath);
    const imageData = await sharp(fileData).metadata();
    const fileName = filePath.split("/").pop();
    return {
        fileName,
        totalSize: imageData.size,
        width: imageData.width,
        height: imageData.height,
    };
}
export async function getFileSize(filePath) {
    return fs.promises.stat(filePath).then((s) => s.size);
}
export async function getGifMetaData(filePath) {
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
export async function decodeEventData(parsed, cipherKey) {
    const rawData = parsed.data;
    const encryptType = parsed.encrypt;
    if (encryptType === 0)
        return JSON.parse(rawData);
    const decodedBuffer = decodeBase64ToBuffer(encryptType === 1 ? rawData : decodeURIComponent(rawData));
    let decryptedBuffer = decodedBuffer;
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
        }
        else {
            throw new ZaloApiError("Invalid data length or missing cipher key");
        }
    }
    const decompressedBuffer = encryptType === 3 ? new Uint8Array(decryptedBuffer) : pako.inflate(decryptedBuffer);
    const decodedData = decodeUnit8Array(decompressedBuffer);
    if (!decodedData)
        return;
    return JSON.parse(decodedData);
}
export function getMd5LargeFileObject(filePath, fileSize) {
    return new Promise(async (resolve, reject) => {
        let chunkSize = 2097152, // Read in chunks of 2MB
        chunks = Math.ceil(fileSize / chunkSize), currentChunk = 0, spark = new SparkMD5.ArrayBuffer(), buffer = await fs.promises.readFile(filePath);
        function loadNext() {
            let start = currentChunk * chunkSize, end = start + chunkSize >= fileSize ? fileSize : start + chunkSize;
            // @ts-ignore
            spark.append(buffer.subarray(start, end));
            currentChunk++;
            if (currentChunk < chunks) {
                loadNext();
            }
            else {
                resolve({
                    currentChunk,
                    data: spark.end(),
                });
            }
        }
        loadNext();
    });
}
export const logger = (ctx) => ({
    verbose: (...args) => {
        if (ctx.options.logging)
            console.log("\x1b[35m🚀 VERBOSE\x1b[0m", ...args);
    },
    info: (...args) => {
        if (ctx.options.logging)
            console.log("\x1b[34mINFO\x1b[0m", ...args);
    },
    warn: (...args) => {
        if (ctx.options.logging)
            console.log("\x1b[33mWARN\x1b[0m", ...args);
    },
    error: (...args) => {
        if (ctx.options.logging)
            console.log("\x1b[31mERROR\x1b[0m", ...args);
    },
});
export function getClientMessageType(msgType) {
    if (msgType === "webchat")
        return 1;
    if (msgType === "chat.voice")
        return 31;
    if (msgType === "chat.photo")
        return 32;
    if (msgType === "chat.sticker")
        return 36;
    if (msgType === "chat.doodle")
        return 37;
    if (msgType === "chat.recommended")
        return 38;
    if (msgType === "chat.link")
        return 38; // don't know || if (msgType === "chat.link") return 1;
    if (msgType === "chat.video.msg")
        return 44; // not sure
    if (msgType === "share.file")
        return 46;
    if (msgType === "chat.gif")
        return 49;
    if (msgType === "chat.location.new")
        return 43;
    return 1;
}
export function strPadLeft(e, t, n) {
    const a = (e = "" + e).length;
    return a === n ? e : a > n ? e.slice(-n) : t.repeat(n - a) + e;
}
export function formatTime(format, timestamp = Date.now()) {
    const date = new Date(timestamp);
    // using lib Intl
    const options = {
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
export function getFullTimeFromMillisecond(e) {
    let t = new Date(e);
    return (strPadLeft(t.getHours(), "0", 2) +
        ":" +
        strPadLeft(t.getMinutes(), "0", 2) +
        " " +
        strPadLeft(t.getDate(), "0", 2) +
        "/" +
        strPadLeft(t.getMonth() + 1, "0", 2) +
        "/" +
        t.getFullYear());
}
export function getFileExtension(e) {
    return path.extname(e).slice(1);
}
export function getFileName(e) {
    return path.basename(e);
}
export function removeUndefinedKeys(e) {
    for (let t in e)
        e[t] === undefined && delete e[t];
    return e;
}
export function getGroupEventType(act) {
    if (act == "join_request")
        return GroupEventType.JOIN_REQUEST;
    if (act == "join")
        return GroupEventType.JOIN;
    if (act == "leave")
        return GroupEventType.LEAVE;
    if (act == "remove_member")
        return GroupEventType.REMOVE_MEMBER;
    if (act == "block_member")
        return GroupEventType.BLOCK_MEMBER;
    if (act == "update_setting")
        return GroupEventType.UPDATE_SETTING;
    if (act == "update")
        return GroupEventType.UPDATE;
    if (act == "new_link")
        return GroupEventType.NEW_LINK;
    if (act == "add_admin")
        return GroupEventType.ADD_ADMIN;
    if (act == "remove_admin")
        return GroupEventType.REMOVE_ADMIN;
    if (act == "new_pin_topic")
        return GroupEventType.NEW_PIN_TOPIC;
    if (act == "update_pin_topic")
        return GroupEventType.UPDATE_PIN_TOPIC;
    if (act == "update_topic")
        return GroupEventType.UPDATE_TOPIC;
    if (act == "update_board")
        return GroupEventType.UPDATE_BOARD;
    if (act == "remove_board")
        return GroupEventType.REMOVE_BOARD;
    if (act == "reorder_pin_topic")
        return GroupEventType.REORDER_PIN_TOPIC;
    if (act == "unpin_topic")
        return GroupEventType.UNPIN_TOPIC;
    if (act == "remove_topic")
        return GroupEventType.REMOVE_TOPIC;
    if (act == "accept_remind")
        return GroupEventType.ACCEPT_REMIND;
    if (act == "reject_remind")
        return GroupEventType.REJECT_REMIND;
    if (act == "remind_topic")
        return GroupEventType.REMIND_TOPIC;
    return GroupEventType.UNKNOWN;
}
export function getFriendEventType(act) {
    if (act == "add")
        return FriendEventType.ADD;
    if (act == "remove")
        return FriendEventType.REMOVE;
    if (act == "block")
        return FriendEventType.BLOCK;
    if (act == "unblock")
        return FriendEventType.UNBLOCK;
    if (act == "block_call")
        return FriendEventType.BLOCK_CALL;
    if (act == "unblock_call")
        return FriendEventType.UNBLOCK_CALL;
    if (act == "req_v2")
        return FriendEventType.REQUEST;
    if (act == "reject")
        return FriendEventType.REJECT_REQUEST;
    if (act == "undo_req")
        return FriendEventType.UNDO_REQUEST;
    if (act == "seen_fr_req")
        return FriendEventType.SEEN_FRIEND_REQUEST;
    if (act == "pin_unpin")
        return FriendEventType.PIN_UNPIN;
    if (act == "pin_create")
        return FriendEventType.PIN_CREATE;
    return FriendEventType.UNKNOWN;
}
export async function handleZaloResponse(ctx, response, isEncrypted = true) {
    const result = {
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
        const jsonData = await response.json();
        if (jsonData.error_code != 0) {
            result.error = {
                message: jsonData.error_message,
                code: jsonData.error_code,
            };
            return result;
        }
        const decodedData = isEncrypted ? JSON.parse(decodeAES(ctx.secretKey, jsonData.data)) : jsonData;
        if (decodedData.error_code != 0) {
            result.error = {
                message: decodedData.error_message,
                code: decodedData.error_code,
            };
            return result;
        }
        result.data = decodedData.data;
    }
    catch (error) {
        console.error(error);
        result.error = {
            message: "Failed to parse response data",
        };
    }
    return result;
}
export async function resolveResponse(ctx, res, cb, isEncrypted) {
    const result = await handleZaloResponse(ctx, res, isEncrypted);
    if (result.error)
        throw new ZaloApiError(result.error.message, result.error.code);
    if (cb)
        return cb(result);
    return result.data;
}
export function apiFactory() {
    return (callback) => {
        return (ctx, api) => {
            if (!isContextSession(ctx))
                throw new ZaloApiError("Invalid context " + JSON.stringify(ctx, null, 2));
            const utils = {
                makeURL(baseURL, params, apiVersion) {
                    return makeURL(ctx, baseURL, params, apiVersion);
                },
                encodeAES(data, t) {
                    return encodeAES(ctx.secretKey, data, t);
                },
                request(url, options, raw) {
                    return request(ctx, url, options, raw);
                },
                logger: logger(ctx),
                resolve: (res, cb, isEncrypted) => resolveResponse(ctx, res, cb, isEncrypted),
            };
            return callback(api, ctx, utils);
        };
    };
}
export function generateZaloUUID(userAgent) {
    return crypto.randomUUID() + "-" + cryptojs.MD5(userAgent).toString();
}
