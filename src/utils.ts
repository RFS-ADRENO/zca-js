import cryptojs from "crypto-js";
import { appContext } from "./context.js";
import fs from "node:fs";
import sharp from "sharp";
import pako from "pako";
import SparkMD5 from "spark-md5"

export function getSignKey(type: string, params: Record<string, any>) {
    let n = [];
    for (let s in params) {
        if (params.hasOwnProperty(s)) {
            n.push(s);
        }

        n.sort();
        let a = "zsecure" + type;
        for (let s = 0; s < n.length; s++) a += params[n[s]];
        return cryptojs.MD5(a).toString();
    }
}

export function makeURL(baseURL: string, params: Record<string, any>) {
    let url = new URL(baseURL);
    for (let key in params) {
        if (params.hasOwnProperty(key)) {
            url.searchParams.append(key, params[key]);
        }
    }
    return url.toString();
}

export class ParamsEncryptor {
    private zcid: string | null = null;
    private enc_ver: string;
    private zcid_ext: string;
    private encryptKey: string | null;
    constructor({
        type,
        imei,
        firstLaunchTime,
    }: {
        type: number;
        imei: string;
        firstLaunchTime: number;
    }) {
        this.enc_ver = "v2";
        this.zcid = null;
        this.encryptKey = null;

        this.createZcid(type, imei, firstLaunchTime);
        this.zcid_ext = ParamsEncryptor.randomString();
        this.createEncryptKey();
    }

    getEncryptKey() {
        if (!this.encryptKey) throw new Error("getEncryptKey: didn't create encryptKey yet");
        return this.encryptKey;
    }

    createZcid(type: number, imei: string, firstLaunchTime: number) {
        if (!type || !imei || !firstLaunchTime) throw new Error("createZcid: missing params");
        const msg = `${type},${imei},${firstLaunchTime}`;
        const s = ParamsEncryptor.encodeAES("3FC4F0D2AB50057BCE0D90D9187A22B1", msg, "hex", true);
        this.zcid = s;
    }

    createEncryptKey(e = 0) {
        const t = (e: string, t: string) => {
            const { even: n } = ParamsEncryptor.processStr(e),
                { even: a, odd: s } = ParamsEncryptor.processStr(t);
            if (!n || !a || !s) return !1;
            const i =
                n.slice(0, 8).join("") +
                a.slice(0, 12).join("") +
                s.reverse().slice(0, 12).join("");
            return (this.encryptKey = i), !0;
        };
        if (!this.zcid || !this.zcid_ext)
            throw new Error("createEncryptKey: zcid or zcid_ext is null");
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
            for (; s > 0;)
                (e += Math.random()
                    .toString(16)
                    .substr(2, s > 12 ? 12 : s)),
                    (s -= 12);
            return e;
        }
        return Math.random().toString(16).substr(2, s);
    }

    static encodeAES(
        e: string,
        message: string,
        type: "hex" | "base64",
        uppercase: boolean,
        s = 0
    ): string | null {
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
        }
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
            }
        ).toString(cryptojs.enc.Utf8);
    } catch (n) {
        return t < 3 ? decodeAES(secretKey, data, t + 1) : null;
    }
}

function updateCookie(input: string | string[]) {
    if (!appContext.cookie) throw new Error("Cookie is not available");
    if (typeof input !== "string" || !Array.isArray(input)) return null;

    const cookieMap = new Map<string, string>();
    const cookie = appContext.cookie;
    cookie.split(";").forEach((cookie) => {
        const [key, value] = cookie.split("=");
        cookieMap.set(key.trim(), value.trim());
    });

    let newCookie: string;
    if (Array.isArray(input)) newCookie = input.map((cookie) => cookie.split(";")[0]).join("; ");
    else newCookie = input;

    newCookie.split(";").forEach((cookie) => {
        const [key, value] = cookie.split("=");
        cookieMap.set(key.trim(), value.trim());
    });

    return Array.from(cookieMap.entries())
        .map(([key, value]) => `${key}=${value}`)
        .join("; ");
}

export function getDefaultHeaders() {
    if (!appContext.cookie) throw new Error("Cookie is not available");
    if (!appContext.userAgent) throw new Error("User agent is not available");

    return {
        Accept: "application/json, text/plain, */*",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "en-US,en;q=0.9",
        "content-type": "application/x-www-form-urlencoded",
        Cookie: appContext.cookie,
        Origin: "https://chat.zalo.me",
        Referer: "https://chat.zalo.me/",
        "User-Agent": appContext.userAgent,
    };
}

export async function request(url: string, options?: RequestInit) {
    if (options) options.headers = mergeHeaders(options.headers || {}, getDefaultHeaders());
    else options = { headers: getDefaultHeaders() };

    const response = await fetch(url, options);
    if (response.headers.has("set-cookie")) {
        const newCookie = updateCookie(response.headers.get("set-cookie")!);
        if (newCookie) appContext.cookie = newCookie;
    }

    return response;
}

function mergeHeaders(headers: HeadersInit, defaultHeaders: Record<string, string>) {
    return {
        ...defaultHeaders,
        ...headers,
    };
}

export async function handleImage(filePath: string) {
    const fileData = fs.readFileSync(filePath);
    const imageData = await sharp(fileData).metadata();
    const fileName = filePath.split("/").pop()!;

    return {
        fileName,
        totalSize: imageData.size,
        width: imageData.width,
        height: imageData.height,
    }
}

export function handleVideo(filePath: string) {
    return fs.statSync(filePath).size;
}

export async function handleGif(filePath: string) {
    const fileData = fs.readFileSync(filePath);
    const gifData = await sharp(fileData).metadata();
    const fileName = filePath.split("/").pop()!;

    return {
        fileName,
        totalSize: gifData.size,
        width: gifData.width,
        height: gifData.height,
    }
}

export async function decodeEventData(parsed: any, cipherKey?: string) {
    if (!cipherKey) return;

    const eventData = parsed.data;
    const decodedEventDataBuffer = decodeBase64ToBuffer(
        decodeURIComponent(eventData)
    );

    if (decodedEventDataBuffer.length >= 48) {
        const algorithm = {
            name: "AES-GCM",
            iv: decodedEventDataBuffer.subarray(0, 16),
            tagLength: 128,
            additionalData: decodedEventDataBuffer.subarray(16, 32),
        };
        const dataSource = decodedEventDataBuffer.subarray(32);

        const cryptoKey = await crypto.subtle.importKey(
            "raw",
            decodeBase64ToBuffer(cipherKey),
            algorithm,
            false,
            ["decrypt"]
        );
        const decryptedData = await crypto.subtle.decrypt(
            algorithm,
            cryptoKey,
            dataSource
        );
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
    }>((resolve, reject) => {
        let chunkSize = 2097152, // Read in chunks of 2MB
            chunks = Math.ceil(fileSize / chunkSize),
            currentChunk = 0,
            spark = new SparkMD5.ArrayBuffer(),
            buffer = fs.readFileSync(filePath);

        function loadNext() {
            let start = currentChunk * chunkSize,
                end = ((start + chunkSize) >= fileSize) ? fileSize : start + chunkSize;

            spark.append(buffer.subarray(start, end));
            currentChunk++;

            if (currentChunk < chunks) {
                loadNext();
            } else {
                resolve({
                    currentChunk,
                    data: spark.end()
                });
            }
        }

        loadNext();
    })
}

export const logger = {
    verbose: (...args: any[]) => {
        console.log("\x1b[2mVERBOSE\x1b[0m", ...args);
    },
    info: (...args: any[]) => {
        console.log("\x1b[34mINFO\x1b[0m", ...args);
    },
    warn: (...args: any[]) => {
        console.log("\x1b[33mWARN\x1b[0m", ...args);
    },
    error: (...args: any[]) => {
        console.log("\x1b[31mERROR\x1b[0m", ...args);
    },
}
