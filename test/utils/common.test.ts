import { describe, expect, test } from "bun:test";
import { formatTime, getFullTimeFromMillisecond, getGroupEventType, getFriendEventType, getClientMessageType, removeUndefinedKeys, strPadLeft, hasOwn } from "../../src/utils/common.js";
import { GroupEventType } from "../../src/models/GroupEvent.js";
import { FriendEventType } from "../../src/models/FriendEvent.js";

describe("Common Utils", () => {
    describe("strPadLeft", () => {
        test("should pad string with given char to length", () => {
            expect(strPadLeft("1", "0", 3)).toBe("001");
            expect(strPadLeft(1, "0", 3)).toBe("001");
        });

        test("should not pad if length is equal", () => {
            expect(strPadLeft("123", "0", 3)).toBe("123");
        });

        test("should truncate if length is greater", () => {
            expect(strPadLeft("1234", "0", 3)).toBe("234");
        });
    });

    describe("hasOwn", () => {
        test("should return true if property exists", () => {
            expect(hasOwn({ a: 1 }, "a")).toBe(true);
        });

        test("should return false if property does not exist", () => {
            expect(hasOwn({ a: 1 }, "b")).toBe(false);
        });
    });

    describe("removeUndefinedKeys", () => {
        test("should remove keys with undefined values", () => {
            const input = { a: 1, b: undefined, c: 3 };
            expect(removeUndefinedKeys(input)).toEqual({ a: 1, c: 3 });
        });

        test("should return same object if no undefined keys", () => {
            const input = { a: 1, c: 3 };
            expect(removeUndefinedKeys(input)).toEqual({ a: 1, c: 3 });
        });
    });

    describe("getGroupEventType", () => {
        test("should map actions to GroupEventType", () => {
            expect(getGroupEventType("join")).toBe(GroupEventType.JOIN);
            expect(getGroupEventType("leave")).toBe(GroupEventType.LEAVE);
            expect(getGroupEventType("unknown_action")).toBe(GroupEventType.UNKNOWN);
        });
    });

    describe("getFriendEventType", () => {
        test("should map actions to FriendEventType", () => {
            expect(getFriendEventType("add")).toBe(FriendEventType.ADD);
            expect(getFriendEventType("remove")).toBe(FriendEventType.REMOVE);
            expect(getFriendEventType("unknown")).toBe(FriendEventType.UNKNOWN);
        });
    });

    describe("getClientMessageType", () => {
        test("should map message types to numbers", () => {
            expect(getClientMessageType("webchat")).toBe(1);
            expect(getClientMessageType("chat.photo")).toBe(32);
            expect(getClientMessageType("uknown.type")).toBe(1);
        });
    });

    describe("formatTime", () => {
        test("should format time correctly", () => {
            const timestamp = 1672531200000; // 2023-01-01 07:00:00 UTC+7
            const formatted = formatTime("%d/%m/%Y", timestamp);
            expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
        });
    });

    describe("getFullTimeFromMillisecond", () => {
        test("should return formatted string", () => {
            const timestamp = 1672531200000;
            const res = getFullTimeFromMillisecond(timestamp);
            expect(res).toMatch(/\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}/);
        });
    });
});
