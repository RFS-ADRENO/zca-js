import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import { CookieJar } from "tough-cookie";
import { createContext, type ContextSession } from "../src/context.js";

class FakeWebSocket {
    static CLOSED = 3;
    static instances: FakeWebSocket[] = [];
    readyState = 1;
    onopen?: () => void;
    onclose?: (event: { code: number; reason: string }) => void;
    onerror?: (event: unknown) => void;
    onmessage?: (event: { data: Buffer }) => Promise<void>;
    close = mock((code: number) => {
        void code;
    });
    send = mock((data: DataView) => {
        void data;
    });

    constructor(readonly url: string) {
        FakeWebSocket.instances.push(this);
    }

    closed(code = 1006) {
        this.readyState = FakeWebSocket.CLOSED;
        this.onclose?.({ code, reason: "test close" });
    }
}

mock.module("ws", () => ({ default: FakeWebSocket }));
const { Listener, CloseReason } = await import("../src/apis/listen.js");

function createListener(configure?: (ctx: ContextSession) => void) {
    const ctx = {
        ...createContext(),
        cookie: new CookieJar(),
        userAgent: "listener-test",
        settings: {
            features: {
                socket: {
                    close_and_retry_codes: [1006],
                    rotate_error_codes: [],
                    retries: { "1006": { times: [100, 200], max: 2 } },
                    ping_interval: 1000,
                },
            },
        },
    } as unknown as ContextSession;
    ctx.options.logging = false;
    configure?.(ctx);
    return new Listener(ctx, ["wss://example.invalid/listener"]);
}

function messageFrame(cmd: number, data: unknown) {
    const header = Buffer.from([1, 0, 0, 0]);
    header.writeUInt16LE(cmd, 1);
    return {
        data: Buffer.concat([header, Buffer.from(JSON.stringify({ encrypt: 0, data: JSON.stringify({ data }) }))]),
    };
}

const timers = new Map<number, { callback: () => void; at: number }>();
let now = 0;
let nextTimer = 0;

function advanceTime(ms: number) {
    const until = now + ms;
    while (true) {
        const next = [...timers.entries()].sort((a, b) => a[1].at - b[1].at)[0];
        if (!next || next[1].at > until) break;
        now = next[1].at;
        timers.delete(next[0]);
        next[1].callback();
    }
    now = until;
}

describe("listener connection lifecycle", () => {
    beforeEach(() => {
        now = 0;
        timers.clear();
        spyOn(globalThis, "setTimeout").mockImplementation(((callback: () => void, delay = 0) => {
            const id = ++nextTimer;
            timers.set(id, { callback, at: now + delay });
            return id;
        }) as unknown as typeof setTimeout);
        spyOn(globalThis, "clearTimeout").mockImplementation(((id: number) => {
            timers.delete(id);
        }) as unknown as typeof clearTimeout);
        spyOn(globalThis, "setInterval").mockImplementation(((callback: () => void) => {
            const id = ++nextTimer;
            timers.set(id, { callback, at: Infinity });
            return id;
        }) as unknown as typeof setInterval);
        spyOn(globalThis, "clearInterval").mockImplementation(((id: number) => {
            timers.delete(id);
        }) as unknown as typeof clearInterval);
        FakeWebSocket.instances = [];
    });

    afterEach(() => {
        mock.restore();
        timers.clear();
    });

    test("stop cancels a pending reconnect, including repeated stop calls", () => {
        const listener = createListener();
        listener.start({ retryOnClose: true });
        FakeWebSocket.instances[0].closed();
        listener.stop();
        listener.stop();
        expect(timers.size).toBe(0);
        advanceTime(1000);
        expect(FakeWebSocket.instances).toHaveLength(1);
    });

    test("a manual restart cancels the previous retry", () => {
        const listener = createListener();
        listener.start({ retryOnClose: true });
        FakeWebSocket.instances[0].closed();
        listener.stop();
        listener.start();
        expect(() => advanceTime(1000)).not.toThrow();
        expect(FakeWebSocket.instances).toHaveLength(2);
        expect(() => listener.start()).toThrow("Already started");
    });

    test("start during a retry delay replaces the scheduled reconnect", () => {
        const listener = createListener();
        listener.start({ retryOnClose: true });
        FakeWebSocket.instances[0].closed();
        listener.start();
        expect(() => advanceTime(1000)).not.toThrow();
        expect(FakeWebSocket.instances).toHaveLength(2);
    });

    test("a late close cannot reset or retry over a new connection", () => {
        const listener = createListener();
        const disconnected = mock(() => {});
        listener.on("disconnected", disconnected);
        listener.start({ retryOnClose: true });
        const oldSocket = FakeWebSocket.instances[0];
        listener.stop();
        listener.start();
        oldSocket.closed();
        expect(disconnected).not.toHaveBeenCalled();
        expect(() => listener.start()).toThrow("Already started");
        listener.sendWs({ version: 1, cmd: 2, subCmd: 1, data: {} });
        expect(FakeWebSocket.instances[1].send).toHaveBeenCalledTimes(1);
        advanceTime(1000);
        expect(FakeWebSocket.instances).toHaveLength(2);
    });

    test("stop inside disconnected prevents scheduling a retry", () => {
        const listener = createListener();
        listener.on("disconnected", () => listener.stop());
        listener.start({ retryOnClose: true });
        FakeWebSocket.instances[0].closed();
        advanceTime(1000);
        expect(FakeWebSocket.instances).toHaveLength(1);
    });

    test("start inside disconnected takes ownership of the connection", () => {
        const listener = createListener();
        listener.on("disconnected", () => listener.start());
        listener.start({ retryOnClose: true });
        FakeWebSocket.instances[0].closed();
        expect(() => advanceTime(1000)).not.toThrow();
        expect(FakeWebSocket.instances).toHaveLength(2);
    });

    test("manual close still emits disconnected and closed without reconnecting", () => {
        const listener = createListener();
        const events: string[] = [];
        listener.on("disconnected", () => events.push("disconnected"));
        listener.onClosed(() => events.push("legacy closed"));
        listener.on("closed", () => events.push("closed"));
        listener.start({ retryOnClose: true });
        listener.stop();
        expect(FakeWebSocket.instances[0].close).toHaveBeenCalledWith(CloseReason.ManualClosure);
        FakeWebSocket.instances[0].closed(CloseReason.ManualClosure);
        expect(events).toEqual(["disconnected", "legacy closed", "closed"]);
        expect(timers.size).toBe(0);
    });

    test("retry delays and exhaustion remain unchanged", () => {
        const listener = createListener();
        const closed = mock(() => {});
        listener.on("closed", closed);
        listener.start({ retryOnClose: true });
        FakeWebSocket.instances[0].closed();
        advanceTime(99);
        expect(FakeWebSocket.instances).toHaveLength(1);
        advanceTime(1);
        expect(FakeWebSocket.instances).toHaveLength(2);
        FakeWebSocket.instances[1].closed();
        advanceTime(199);
        expect(FakeWebSocket.instances).toHaveLength(2);
        advanceTime(1);
        FakeWebSocket.instances[2].closed();
        expect(closed).toHaveBeenCalledTimes(1);
        expect(timers.size).toBe(0);
    });

    test("late open, error and cipher-key callbacks cannot affect a new connection", async () => {
        const listener = createListener();
        const connected = mock(() => {});
        const error = mock(() => {});
        const cipherKey = mock(() => {});
        listener.on("connected", connected);
        listener.on("error", error);
        listener.on("cipher_key", cipherKey);
        listener.start();
        const oldSocket = FakeWebSocket.instances[0];
        listener.stop();
        listener.start();
        oldSocket.onopen?.();
        oldSocket.onerror?.(new Error("stale error"));
        await oldSocket.onmessage?.({
            data: Buffer.concat([Buffer.from([1, 1, 0, 1]), Buffer.from('{"key":"test-key"}')]),
        });
        expect(connected).not.toHaveBeenCalled();
        expect(error).not.toHaveBeenCalled();
        expect(cipherKey).not.toHaveBeenCalled();
        expect(timers.size).toBe(0);
    });

    test("stop while decoding a message discards its result", async () => {
        const listener = createListener();
        const messages = mock(() => {});
        listener.on("old_messages", messages);
        listener.start();
        const pending = FakeWebSocket.instances[0].onmessage?.({
            data: Buffer.concat([
                Buffer.from([1, 254, 1, 1]),
                Buffer.from(JSON.stringify({ encrypt: 0, data: JSON.stringify({ data: { msgs: [] } }) })),
            ]),
        });
        listener.stop();
        listener.start();
        await pending;
        expect(messages).not.toHaveBeenCalled();
    });

    test("stop in cipher_key does not leave a ping interval running", async () => {
        const listener = createListener();
        listener.on("cipher_key", () => listener.stop());
        listener.start();
        await FakeWebSocket.instances[0].onmessage?.({
            data: Buffer.concat([Buffer.from([1, 1, 0, 1]), Buffer.from('{"key":"test-key"}')]),
        });
        expect(timers.size).toBe(0);
    });

    test.each([
        [501, false],
        [501, true],
        [521, false],
        [521, true],
    ] as const)("stop ends a message batch (cmd: %s, legacy: %s)", async (cmd, legacy) => {
        const listener = createListener();
        const delivered: unknown[] = [];
        const callback = () => {
            delivered.push("callback");
            listener.stop();
            listener.start();
        };
        if (legacy) listener.onMessage(callback);
        else listener.on("message", callback);
        const legacyMessages = mock(() => {});
        if (!legacy) listener.onMessage(legacyMessages);
        const emitted = mock(() => {});
        if (legacy) listener.on("message", emitted);
        listener.start();
        await FakeWebSocket.instances[0].onmessage?.(
            messageFrame(cmd, {
                [cmd === 501 ? "msgs" : "groupMsgs"]: ["first", "second"].map((content) => ({
                    content,
                    uidFrom: "sender",
                    idTo: "recipient",
                })),
            }),
        );
        expect(delivered).toEqual(["callback"]);
        if (!legacy) expect(legacyMessages).toHaveBeenCalledTimes(1);
        expect(emitted).not.toHaveBeenCalled();
        expect(FakeWebSocket.instances).toHaveLength(2);
    });

    test("restart in a decode error callback does not emit an old error", async () => {
        const listener = createListener();
        const errors = mock(() => {});
        listener.on("error", errors);
        listener.onError(() => {
            listener.stop();
            listener.start();
        });
        listener.start();
        await FakeWebSocket.instances[0].onmessage?.({ data: Buffer.from([1, 245, 1, 0, 123]) });
        expect(errors).not.toHaveBeenCalled();
        expect(FakeWebSocket.instances).toHaveLength(2);
    });

    test("stop in a delivery receipt handler prevents later seen receipts", async () => {
        const listener = createListener();
        const seen = mock(() => {});
        listener.on("delivered_messages", () => listener.stop());
        listener.on("seen_messages", seen);
        listener.start();
        await FakeWebSocket.instances[0].onmessage?.(
            messageFrame(502, {
                delivereds: [{ deliveredUids: ["recipient"] }],
                seens: [{ idTo: "recipient" }],
            }),
        );
        expect(seen).not.toHaveBeenCalled();
    });
});
