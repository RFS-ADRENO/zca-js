import fs from "node:fs";
import { SyncDeviceStatus, ThreadType, Zalo } from "../src/index.js";

/**
 * Sync conversations and messages from your phone, like the "Sync messages" feature of Zalo Web.
 *
 * Your phone must be online with Zalo opened, you may have to confirm the request there.
 *
 * Usage: bun run examples/sync.ts
 */

const zalo = new Zalo();
// { cookie, imei, userAgent }
const api = await zalo.login(JSON.parse(fs.readFileSync("./examples/credentials.json", "utf-8")));

api.listener.on("error", (error) => console.error("Listener error:", error));
api.listener.start();
await new Promise<void>((resolve) => api.listener.once("cipher_key", () => resolve()));

try {
    const { conversations, errors } = await api.syncMessages({
        // last 7 days
        from: Date.now() - 7 * 24 * 60 * 60 * 1000,
        onProgress(progress) {
            if (progress.type == "device_status") {
                if (progress.status == SyncDeviceStatus.WaitingConfirm) {
                    console.log("Please confirm the sync request on your phone...");
                } else console.log("Phone status:", SyncDeviceStatus[progress.status]);
            } else if (progress.type == "conversations") {
                console.log(`Found ${progress.total} conversations`);
            } else {
                console.log(
                    `Synced ${progress.messages} messages (${progress.conversations}/${progress.totalConversations} conversations)`,
                );
            }
        },
    });

    for (const conversation of conversations) {
        const kind = conversation.type == ThreadType.Group ? "group" : "user";
        console.log(`${kind} ${conversation.threadId}: ${conversation.messages.length} messages`);
    }
    if (errors.length > 0) console.log("Some data could not be synced:", errors);
} finally {
    api.listener.stop();
}
