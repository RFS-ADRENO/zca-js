import { FriendEventType } from "../models/FriendEvent.js";
import { GroupEventType } from "../models/GroupEvent.js";

export const isBun = typeof Bun !== "undefined";

export function hasOwn(obj: Record<string, unknown>, key: string): key is keyof typeof obj {
    return Object.prototype.hasOwnProperty.call(obj, key);
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

export type ZaloResponse<T> = {
    data: T | null;
    error: {
        message: string;
        code?: number;
    } | null;
};
