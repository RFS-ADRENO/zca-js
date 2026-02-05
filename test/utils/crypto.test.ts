import { describe, expect, test } from "bun:test";
import { getSignKey, decodeBase64ToBuffer, encodeAES, decodeAES, generateZaloUUID, encryptPin, validatePin, hexToNegativeColor, negativeColorToHex, ParamsEncryptor } from "../../src/utils/crypto.js";

describe("Crypto Utils", () => {
    describe("getSignKey", () => {
        test("should generate correct sign key", () => {
            const params = { b: 2, a: 1 };
            const type = "test";
            // key = MD5("zsecure" + "test" + "1" + "2")
            // MD5("zsecuretest12")
            const key = getSignKey(type, params);
            expect(key).toBeDefined();
            expect(key.length).toBe(32);
        });
    });

    describe("Base64 & Buffer", () => {
        test("should decode base64 to buffer", () => {
            const base64 = "SGVsbG8="; // Hello
            const buffer = decodeBase64ToBuffer(base64);
            expect(buffer.toString()).toBe("Hello");
        });
    });

    describe("AES Encryption", () => {
        const secretKey = "MTIzNDU2Nzg5MDEyMzQ1Ng=="; // Base64 of 1234567890123456
        const plaintext = "Hello World";

        test("should encode and decode correctly", () => {
            const encoded = encodeAES(secretKey, plaintext);
            expect(encoded).not.toBeNull();

            const decoded = decodeAES(secretKey, encoded!);
            expect(decoded).toBe(plaintext);
        });

        test("should return null on invalid decode", () => {
            const invalidEncoded = "invalid_base64";
            const decoded = decodeAES(secretKey, invalidEncoded);
            expect(decoded).toBeFalsy();
        });
    });

    describe("PIN Utils", () => {
        test("should encrypt and validate PIN", () => {
            const pin = "1234";
            const encrypted = encryptPin(pin);
            expect(encrypted.length).toBe(32); // MD5 hex
            expect(validatePin(encrypted, pin)).toBe(true);
            expect(validatePin(encrypted, "0000")).toBe(false);
        });
    });

    describe("Color Utils", () => {
        test("should convert hex to negative color and back", () => {
            const hex = "#000000"; // Black
            const negative = hexToNegativeColor(hex);
            const backToHex = negativeColorToHex(negative);
            // Note: negativeColorToHex returns format #aabbcc
            // hexToNegativeColor handles generic hex
            // Let's test round trip consistency conceptually or specific values
            // 0xFF000000 (ARGB) -> -16777216 decimal for opaque black
            // hexToNegativeColor assumes full opacity if not provided or handles it specifically. 
            // The implementation adds FF if length is 6.

            expect(backToHex.toLowerCase()).toBe(hex.toLowerCase());
        });

        test("white color conversion", () => {
            const hex = "#FFFFFF";
            const negative = hexToNegativeColor(hex);
            const backToHex = negativeColorToHex(negative);
            expect(backToHex.toLowerCase()).toBe(hex.toLowerCase());
        });
    });

    describe("generateZaloUUID", () => {
        test("should generate UUID with user agent hash", () => {
            const ua = "Mozilla/5.0";
            const uuid = generateZaloUUID(ua);
            expect(uuid).toContain("-");
            // MD5 of Mozilla/5.0 is ...
        });
    });

    describe("ParamsEncryptor", () => {
        test("should create instance and generate keys", () => {
            const encryptor = new ParamsEncryptor({
                type: 1,
                imei: "imei123",
                firstLaunchTime: 123456789
            });

            const params = encryptor.getParams();
            expect(params).not.toBeNull();
            expect(params?.zcid).toBeDefined();
            expect(params?.enc_ver).toBe("v2");

            const key = encryptor.getEncryptKey();
            expect(key).toBeDefined();
        });
    });
});
