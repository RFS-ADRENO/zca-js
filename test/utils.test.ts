import { describe, it, expect } from "vitest";
import {
    hasOwn,
    getSignKey,
    getClientMessageType,
    strPadLeft,
    formatTime,
    getFullTimeFromMillisecond,
    getFileExtension,
    getFileName,
    removeUndefinedKeys,
    ParamsEncryptor,
    decodeBase64ToBuffer,
    decodeUnit8Array,
    encodeAES,
    decodeAES,
    hexToNegativeColor,
    negativeColorToHex,
    encryptPin,
    validatePin,
} from "../src/utils.js";

describe("hasOwn", () => {
    it("should return true for own properties", () => {
        expect(hasOwn({ a: 1 }, "a")).toBe(true);
    });

    it("should return false for inherited properties", () => {
        expect(hasOwn({}, "toString")).toBe(false);
    });

    it("should return false for non-existent properties", () => {
        expect(hasOwn({ a: 1 }, "b")).toBe(false);
    });
});

describe("getSignKey", () => {
    it("should return a consistent MD5 hash for the same input", () => {
        const result1 = getSignKey("test", { a: "1", b: "2" });
        const result2 = getSignKey("test", { a: "1", b: "2" });
        expect(result1).toBe(result2);
    });

    it("should sort params by key before hashing", () => {
        const result1 = getSignKey("test", { b: "2", a: "1" });
        const result2 = getSignKey("test", { a: "1", b: "2" });
        expect(result1).toBe(result2);
    });

    it("should return a 32-character hex string", () => {
        const result = getSignKey("test", { a: "1" });
        expect(result).toMatch(/^[a-f0-9]{32}$/);
    });
});

describe("getClientMessageType", () => {
    it("should return correct type for webchat", () => {
        expect(getClientMessageType("webchat")).toBe(1);
    });

    it("should return correct type for chat.voice", () => {
        expect(getClientMessageType("chat.voice")).toBe(31);
    });

    it("should return correct type for chat.photo", () => {
        expect(getClientMessageType("chat.photo")).toBe(32);
    });

    it("should return correct type for chat.sticker", () => {
        expect(getClientMessageType("chat.sticker")).toBe(36);
    });

    it("should return correct type for share.file", () => {
        expect(getClientMessageType("share.file")).toBe(46);
    });

    it("should return 1 for unknown types", () => {
        expect(getClientMessageType("unknown")).toBe(1);
    });
});

describe("strPadLeft", () => {
    it("should pad a number with leading zeros", () => {
        expect(strPadLeft(5, "0", 2)).toBe("05");
    });

    it("should not pad if already correct length", () => {
        expect(strPadLeft(12, "0", 2)).toBe("12");
    });

    it("should truncate if longer than target", () => {
        expect(strPadLeft(123, "0", 2)).toBe("23");
    });
});

describe("formatTime", () => {
    it("should format time with format string", () => {
        const timestamp = new Date(2024, 0, 15, 10, 30, 45).getTime();
        const result = formatTime("%H:%M:%S %d/%m/%Y", timestamp);
        expect(result).toBe("10:30:45 15/01/2024");
    });
});

describe("getFullTimeFromMillisecond", () => {
    it("should format timestamp correctly", () => {
        const timestamp = new Date(2024, 0, 15, 10, 30).getTime();
        const result = getFullTimeFromMillisecond(timestamp);
        expect(result).toBe("10:30 15/01/2024");
    });
});

describe("getFileExtension", () => {
    it("should return file extension", () => {
        expect(getFileExtension("test.png")).toBe("png");
    });

    it("should return last extension for double extensions", () => {
        expect(getFileExtension("archive.tar.gz")).toBe("gz");
    });

    it("should return empty string for no extension", () => {
        expect(getFileExtension("noext")).toBe("");
    });
});

describe("getFileName", () => {
    it("should return filename from path", () => {
        expect(getFileName("/path/to/file.txt")).toBe("file.txt");
    });

    it("should return filename without path", () => {
        expect(getFileName("file.txt")).toBe("file.txt");
    });
});

describe("removeUndefinedKeys", () => {
    it("should remove undefined keys", () => {
        const obj = { a: 1, b: undefined, c: "test" } as Record<string, unknown>;
        expect(removeUndefinedKeys(obj)).toEqual({ a: 1, c: "test" });
    });

    it("should keep null and falsy values", () => {
        const obj = { a: null, b: 0, c: false, d: "" } as Record<string, unknown>;
        expect(removeUndefinedKeys(obj)).toEqual({ a: null, b: 0, c: false, d: "" });
    });
});

describe("ParamsEncryptor", () => {
    describe("processStr", () => {
        it("should split string into even and odd indexed characters", () => {
            const result = ParamsEncryptor.processStr("abcdef");
            expect(result.even).toEqual(["a", "c", "e"]);
            expect(result.odd).toEqual(["b", "d", "f"]);
        });

        it("should return null for empty string", () => {
            const result = ParamsEncryptor.processStr("");
            expect(result.even).toBeNull();
            expect(result.odd).toBeNull();
        });
    });

    describe("randomString", () => {
        it("should return a hex string", () => {
            const result = ParamsEncryptor.randomString();
            expect(result).toMatch(/^[a-f0-9]+$/);
        });

        it("should respect min/max length", () => {
            const result = ParamsEncryptor.randomString(8, 12);
            expect(result.length).toBeGreaterThanOrEqual(8);
            expect(result.length).toBeLessThanOrEqual(12);
        });
    });

    describe("encodeAES", () => {
        it("should return null for empty message", () => {
            expect(ParamsEncryptor.encodeAES("key", "", "hex", false)).toBeNull();
        });

        it("should encode and return hex string", () => {
            const key = "3FC4F0D2AB50057BCE0D90D9187A22B1";
            const result = ParamsEncryptor.encodeAES(key, "test message", "hex", false);
            expect(result).toBeTruthy();
            expect(result).toMatch(/^[a-f0-9]+$/);
        });

        it("should encode and return uppercase hex when requested", () => {
            const key = "3FC4F0D2AB50057BCE0D90D9187A22B1";
            const result = ParamsEncryptor.encodeAES(key, "test message", "hex", true);
            expect(result).toBeTruthy();
            expect(result).toMatch(/^[A-F0-9]+$/);
        });
    });
});

describe("decodeBase64ToBuffer", () => {
    it("should decode base64 string to buffer", () => {
        const result = decodeBase64ToBuffer("aGVsbG8=");
        expect(result.toString("utf-8")).toBe("hello");
    });
});

describe("decodeUnit8Array", () => {
    it("should decode Uint8Array to string", () => {
        const data = new TextEncoder().encode("hello world");
        expect(decodeUnit8Array(data)).toBe("hello world");
    });
});

describe("encodeAES / decodeAES", () => {
    it("should encode and decode data symmetrically", () => {
        // AES-128 requires a 16-byte key, base64 encoded
        const key = Buffer.from("0123456789abcdef").toString("base64");
        const plaintext = "hello world";
        const encoded = encodeAES(key, plaintext);
        expect(encoded).toBeTruthy();
        const decoded = decodeAES(key, encoded!);
        expect(decoded).toBe(plaintext);
    });
});

describe("hexToNegativeColor / negativeColorToHex", () => {
    it("should convert hex to negative color", () => {
        expect(hexToNegativeColor("#00FF00")).toBe(-16711936);
    });

    it("should handle hex without hash", () => {
        expect(hexToNegativeColor("00FF00")).toBe(-16711936);
    });

    it("should convert negative color back to hex", () => {
        expect(negativeColorToHex(-16711936)).toBe("#00ff00");
    });

    it("should be reversible", () => {
        const hex = "#FF5733";
        const negative = hexToNegativeColor(hex);
        const back = negativeColorToHex(negative);
        expect(back).toBe(hex.toLowerCase());
    });
});

describe("encryptPin / validatePin", () => {
    it("should encrypt a PIN to 32-char hex", () => {
        const result = encryptPin("1234");
        expect(result).toMatch(/^[a-f0-9]{32}$/);
    });

    it("should validate correct PIN", () => {
        const encrypted = encryptPin("1234");
        expect(validatePin(encrypted, "1234")).toBe(true);
    });

    it("should reject incorrect PIN", () => {
        const encrypted = encryptPin("1234");
        expect(validatePin(encrypted, "5678")).toBe(false);
    });
});
