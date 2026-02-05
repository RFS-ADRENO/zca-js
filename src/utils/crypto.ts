import cryptojs from "crypto-js";
import crypto from "node:crypto";
import pako from "pako";
import JSONBig from "json-bigint";
import { ZaloApiError } from "../Errors/index.js";
import { hasOwn } from "./common.js";

/**
 * Get signed key for API requests.
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

export function generateZaloUUID(userAgent: string) {
    return crypto.randomUUID() + "-" + cryptojs.MD5(userAgent).toString();
}

/**
 * Encrypts a 4-digit PIN to a 32-character hex string
 */
export function encryptPin(pin: string): string {
    return crypto.createHash("md5").update(pin).digest("hex");
}

/**
 * Decrypts a 32-character hex string back to 4-digit PIN
 */
export function validatePin(encryptedPin: string, pin: string): boolean {
    const hash = crypto.createHash("md5").update(pin).digest("hex");
    return hash === encryptedPin;
}

/**
 * Converts a hex color code to a negative color number used by Zalo API
 */
export function hexToNegativeColor(hex: string): number {
    if (!hex.startsWith("#")) {
        hex = "#" + hex;
    }
    let hexValue = hex.slice(1);
    if (hexValue.length === 6) {
        hexValue = "FF" + hexValue;
    }
    const decimal = parseInt(hexValue, 16);
    return decimal > 0x7fffffff ? decimal - 4294967296 : decimal;
}

/**
 * Converts a negative color number from Zalo API to hex color code
 */
export function negativeColorToHex(negativeColor: number): string {
    const positiveColor = negativeColor + 4294967296;
    return "#" + positiveColor.toString(16).slice(-6).padStart(6, "0"); // rgb with alpha
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
            for (; s > 0;) {
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
