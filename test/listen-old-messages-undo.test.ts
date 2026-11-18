import { describe, expect, mock, test } from "bun:test";
import { CookieJar } from "tough-cookie";
import { createContext, type ContextSession } from "../src/context.js";

class FakeWebSocket {
    static CLOSED = 3;
    static instances: FakeWebSocket[] = [];
    readyState = 1;
    onmessage?: (event: { data: Buffer }) => Promise<void>;
    close = mock(() => {});
    send = mock(() => {});

    constructor(readonly url: string) {
        FakeWebSocket.instances.push(this);
    }
}

mock.module("ws", () => ({ default: FakeWebSocket }));
const { Listener } = await import("../src/apis/listen.js");
const { ThreadType } = await import("../src/models/index.js");

function startListener(selfListen: boolean) {
    const ctx = {
        ...createContext(),
        uid: "100",
        cookie: new CookieJar(),
        userAgent: "listener-test",
        settings: { features: { socket: { close_and_retry_codes: [], rotate_error_codes: [], retries: {} } } },
    } as unknown as ContextSession;
    ctx.options.logging = false;
    ctx.options.selfListen = selfListen;
    const listener = new Listener(ctx, ["wss://example.invalid/listener"]);
    const events: unknown[] = [];
    listener.on("old_messages", (messages, type) =>
        events.push({ event: "old_messages", type, msgIds: messages.map((message) => message.data.msgId) }),
    );
    listener.on("undo", (undo) =>
        events.push({
            event: "undo",
            threadId: undo.threadId,
            isGroup: undo.isGroup,
            isSelf: undo.isSelf,
            recalled: undo.data.content.globalMsgId,
        }),
    );
    listener.start();
    const socket = FakeWebSocket.instances.at(-1)!;
    return { events, send: (cmd: number, subCmd: number, data: unknown) => socket.onmessage!(frame(cmd, subCmd, data)) };
}

function frame(cmd: number, subCmd: number, data: unknown) {
    const header = Buffer.from([1, 0, 0, subCmd]);
    header.writeUInt16LE(cmd, 1);
    return {
        data: Buffer.concat([header, Buffer.from(JSON.stringify({ encrypt: 0, data: JSON.stringify({ data }) }))]),
    };
}

const text = (msgId: string, extra: Record<string, unknown> = {}) => ({
    msgId,
    cliMsgId: `c${msgId}`,
    msgType: "webchat",
    uidFrom: "200",
    idTo: "0",
    ts: "1761089990000",
    content: "hello",
    ...extra,
});

const recall = (recalled: string, extra: Record<string, unknown> = {}) => ({
    msgId: `r${recalled}`,
    cliMsgId: `rc${recalled}`,
    msgType: "chat.undo",
    uidFrom: "200",
    idTo: "0",
    ts: "1761090000000",
    content: { globalMsgId: recalled, cliMsgId: `c${recalled}`, deleteMsg: 0, srcId: "0", destId: "0" },
    ...extra,
});

describe("recalls replayed in old_messages", () => {
    test("a user recall becomes an undo, after the replayed messages", async () => {
        const { events, send } = startListener(true);
        await send(510, 1, { msgs: [text("1"), recall("1"), text("2")] });
        expect(events).toEqual([
            { event: "old_messages", type: ThreadType.User, msgIds: ["1", "2"] },
            { event: "undo", threadId: "200", isGroup: false, isSelf: false, recalled: "1" },
        ]);
    });

    test("a group recall becomes a group undo on the group thread", async () => {
        const { events, send } = startListener(true);
        await send(511, 1, { groupMsgs: [text("3", { idTo: "300" }), recall("3", { idTo: "300" })] });
        expect(events).toEqual([
            { event: "old_messages", type: ThreadType.Group, msgIds: ["3"] },
            { event: "undo", threadId: "300", isGroup: true, isSelf: false, recalled: "3" },
        ]);
    });

    test("an own recall follows selfListen, as on the live path", async () => {
        const own = recall("4", { uidFrom: "0", idTo: "200" });
        const listening = startListener(true);
        await listening.send(510, 1, { msgs: [own] });
        await listening.send(501, 0, { msgs: [recall("5", { uidFrom: "0", idTo: "200" })] });
        expect(listening.events).toEqual([
            { event: "old_messages", type: ThreadType.User, msgIds: [] },
            { event: "undo", threadId: "200", isGroup: false, isSelf: true, recalled: "4" },
            { event: "undo", threadId: "200", isGroup: false, isSelf: true, recalled: "5" },
        ]);

        const silent = startListener(false);
        await silent.send(510, 1, { msgs: [recall("4", { uidFrom: "0", idTo: "200" })] });
        await silent.send(501, 0, { msgs: [recall("5", { uidFrom: "0", idTo: "200" })] });
        expect(silent.events).toEqual([{ event: "old_messages", type: ThreadType.User, msgIds: [] }]);
    });

    test("a replay without recalls is unchanged", async () => {
        const { events, send } = startListener(true);
        await send(510, 1, { msgs: [text("6"), text("7")] });
        expect(events).toEqual([{ event: "old_messages", type: ThreadType.User, msgIds: ["6", "7"] }]);
    });
});
