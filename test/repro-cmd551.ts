/**
 * Reproduction for PR #378 — https://github.com/RFS-ADRENO/zca-js/pull/378
 *
 * WHAT IS PROVEN (routing bug, deterministic):
 *   A valid message frame with cmd = 551 (subCmd 0) matches no handler in
 *   src/apis/listen.ts on main → no "message" event → silent message loss.
 *   With the PR ([501, 551].includes(cmd)) the same frame is delivered.
 *
 * WHAT IS *NOT* PROVEN HERE: why Zalo emits 551 at all. Leading hypothesis is
 * the E2EE channel (SignalCommands.MSG.RECEIVE_ONEONE: 551, found in Zalo Web's
 * sync-v2-worker bundle) gated by a per-account rollout — confirming that
 * requires real accounts with known E2EE state. This harness does NOT depend
 * on it: the mock server replays frames locally.
 *
 * Experimental design (controlled A/B):
 *   frame A: header cmd = 501  ┐
 *                                ├─ byte-identical frames EXCEPT the single
 *   frame B: header cmd = 551  ┘  cmd byte in the 4-byte header (same
 *                                 version/subCmd, same encrypted payload
 *                                 string, i.e. same decrypted msg).
 *   frame C: header cmd = 621  — negative control: no handler anywhere;
 *                                only this one must trigger "Unhandle cmd".
 *
 * Verdict by COUNT of received "message" events:
 *   main     → 1 (only A delivered, B dropped)   = bug reproduced
 *   PR #378  → 2 (both delivered)                = fix works
 *
 * Usage:
 *   npx tsx test/repro-cmd551.ts [--expect 551-dropped|551-handled]
 */
import { randomBytes } from "crypto";
import { createServer } from "http";
import { gzipSync } from "zlib";
import { WebSocketServer, type WebSocket } from "ws";
import { Listener } from "../src/apis/listen.js";
import type { ContextSession } from "../src/context.js";

const SELF_UID = "987654321";

function buildFrame(version: number, cmd: number, subCmd: number, payload: unknown): Buffer {
    const body = Buffer.from(JSON.stringify(payload), "utf-8");
    const header = Buffer.alloc(4);
    header.writeUInt8(version, 0);
    header.writeUInt16LE(cmd, 1);
    header.writeInt8(subCmd, 3);
    return Buffer.concat([header, body]);
}

/**
 * Mirrors what the real Zalo server sends for encrypted pushes (encrypt = 2):
 * gzip(JSON) -> AES-256-GCM (iv = buf[0:16], additionalData = buf[16:32]) ->
 * base64 -> encodeURIComponent. Decoded by decodeEventData() in src/utils.ts.
 */
async function encodeEventData(rawKey: Buffer, data: unknown): Promise<string> {
    const iv = randomBytes(16);
    const additionalData = randomBytes(16);
    const plaintext = gzipSync(Buffer.from(JSON.stringify(data), "utf-8"));

    const key = await crypto.subtle.importKey("raw", rawKey, { name: "AES-GCM" }, false, ["encrypt"]);
    const ciphertext = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv, additionalData, tagLength: 128 },
        key,
        plaintext,
    );

    const packed = Buffer.concat([iv, additionalData, Buffer.from(ciphertext)]);
    return encodeURIComponent(packed.toString("base64"));
}

// One fixed payload shared by frames A and B — the msg's own `cmd` field is
// part of the payload and must NOT differ between the two frames.
function makeMsg() {
    return {
        actionId: "1790000000000",
        msgId: "msg-fixed-0001",
        cliMsgId: "cli-fixed-0001",
        msgType: "webchat",
        uidFrom: "111222333", // sender, not self
        idTo: SELF_UID,
        dName: "Người Gửi",
        ts: "1790000000001",
        status: 1,
        content: "xin chào qua kênh tin nhắn",
        notify: "",
        ttl: 0,
        userId: "111222333",
        uin: "123",
        topOut: "0",
        topOutTimeOut: "0",
        topOutImprTimeOut: "0",
        propertyExt: undefined,
        paramsExt: { countUnread: 1, containType: 0, platformType: 1 },
        cmd: 501,
        st: 0,
        at: 0,
        realMsgId: "real-fixed-0001",
        quote: undefined,
    };
}

// Minimal ContextSession — ContextBase is Partial<AppContextBase> by design,
// the Listener only touches the fields below.
const ctx = {
    uid: SELF_UID,
    API_TYPE: 30,
    API_VERSION: 685,
    cookie: { getCookieStringSync: () => "zpw_enckey=x; zpw_sekey=y" },
    userAgent: "Mozilla/5.0 (repro-cmd551)",
    language: "vi",
    settings: {
        features: {
            socket: {
                ping_interval: 60_000,
                retries: {},
                close_and_retry_codes: [],
                rotate_error_codes: [],
            },
        },
    },
    options: { selfListen: false, logging: true },
    uploadCallbacks: new Map(),
} as unknown as ContextSession;

const expect = process.argv.includes("--expect")
    ? process.argv[process.argv.indexOf("--expect") + 1]
    : null;

const httpServer = createServer();
const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", async (ws: WebSocket) => {
    console.log("[mock zalo] client connected, sending cipher key frame (cmd 1/1)");

    // 1) session key frame — what the real server sends right after connect
    const rawKey = randomBytes(32);
    ws.send(buildFrame(1, 1, 1, { key: rawKey.toString("base64") }));

    // 2) ONE encrypted envelope, reused verbatim for frames A and B — so the
    //    two frames differ ONLY by the cmd byte in the header.
    const sharedEnvelope = {
        data: await encodeEventData(rawKey, { data: { msgs: [makeMsg()] } }),
        encrypt: 2,
    };

    await new Promise((r) => setTimeout(r, 100));
    ws.send(buildFrame(1, 501, 0, sharedEnvelope));
    console.log("[mock zalo] sent frame A: cmd=501 subCmd=0 (control)");

    await new Promise((r) => setTimeout(r, 100));
    ws.send(buildFrame(1, 551, 0, sharedEnvelope));
    console.log("[mock zalo] sent frame B: cmd=551 subCmd=0 (PR #378 case)");

    // 4) a genuinely unknown cmd (seen in the wild) — the "Unhandle cmd" log must fire for this one only
    await new Promise((r) => setTimeout(r, 100));
    ws.send(buildFrame(1, 621, 0, { foo: "bar" }));
    console.log("[mock zalo] sent frame C: cmd=621 subCmd=0 (no handler — log guard check)");
});

await new Promise<void>((resolve) => httpServer.listen(0, "127.0.0.1", resolve));
const port = (httpServer.address() as { port: number }).port;
console.log(`[mock zalo] listening on ws://127.0.0.1:${port}`);

const listener = new Listener(ctx, [`ws://127.0.0.1:${port}`]);

const received: string[] = [];
listener.on("connected", () => console.log("[listener] connected"));
listener.on("cipher_key", () => console.log("[listener] cipher_key event fired"));
listener.on("error", (e) => console.log("[listener] error event fired:", e));
listener.on("message", (msg) => {
    const content = typeof msg.data.content === "string" ? msg.data.content : "(non-text)";
    console.log(`[listener] message event fired: ${content}`);
    received.push(content);
});

listener.start();

await new Promise((r) => setTimeout(r, 1500));

listener.stop();
wss.close();
httpServer.close();

const gotA = received.length >= 1;
const gotB = received.length >= 2;
const allIdentical = received.length > 0 && received.every((c) => c === received[0]);

console.log("\n==================== RESULT ====================");
console.log(`message events received             : ${received.length} (expected: main=1, PR=2)`);
console.log(`frame A  cmd=501 (control)          : ${gotA ? "DELIVERED" : "DROPPED"}`);
console.log(`frame B  cmd=551 (PR #378 case)     : ${gotB ? "DELIVERED" : "DROPPED  <-- on main: matches no handler, message silently lost"}`);
console.log(`A/B payloads decoded identically    : ${allIdentical ? "yes (only the header cmd differed)" : "NO — harness broken"}`);
console.log("===============================================");

if (allIdentical === false) {
    console.error("FAIL: frames A/B should decode to identical messages — harness is broken");
    process.exit(1);
}
if (expect === "551-dropped" && received.length !== 1) {
    console.error("FAIL: expected exactly 1 message (551 dropped, main behavior), got " + received.length);
    process.exit(1);
}
if (expect === "551-handled" && received.length !== 2) {
    console.error("FAIL: expected exactly 2 messages (551 handled, PR #378 behavior), got " + received.length);
    process.exit(1);
}
if (expect && !gotA) {
    console.error("FAIL: control cmd=501 frame was not delivered — harness is broken");
    process.exit(1);
}
process.exit(0);
