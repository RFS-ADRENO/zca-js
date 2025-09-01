import path from "node:path";
import fs from "node:fs";

import { Reactions, Zalo } from "../src/index.js";
import { ThreadType } from "../src/models/index.js";
const zalo = new Zalo({
    selfListen: true,
    logging: true,
});

const api = await zalo.login(JSON.parse(fs.readFileSync(path.resolve("./test/credentials.json"), "utf-8")));

const { listener } = api;

listener.on("connected", () => {
    console.log("Connected");
});

listener.on("closed", (code, reason) => {
    console.log("Closed:", code, reason);
});

listener.on("error", (error) => {
    console.error("Error:", error);
});

listener.on("message", (message) => {
    console.log("Message:", message.threadId, message.data.content);
    switch (message.type) {
        case ThreadType.User:
            api.addReaction(Reactions.HAHA, message).then(console.log);
            if (!message.data.content || typeof message.data.content != "string") return;
            if (!message.isSelf) {
                switch (message.data.content) {
                    case "reply": {
                        api.sendMessage(
                            {
                                msg: "reply",
                                quote: message.data,
                            },
                            message.threadId,
                            message.type,
                        ).then(console.log);
                        break;
                    }
                    case "ping": {
                        api.sendMessage("pong", message.threadId).then(console.log);
                        break;
                    }
                    default: {
                        const args = message.data.content.split(/\s+/);
                        if (args[0] == "sticker" && args[1]) {
                            api.getStickers(args[1]).then(async (stickerIds) => {
                                const random = stickerIds[Math.floor(Math.random() * stickerIds.length)];
                                const sticker = await api.getStickersDetail(random);
                                console.log("Sending sticker:", sticker[0]);

                                if (random) api.sendSticker(sticker[0], message.threadId).then(console.log);
                                else api.sendMessage("No sticker found", message.threadId).then(console.log);
                            });
                        }
                        break;
                    }
                }
            } else {
                const args = message.data.content.split(/\s+/);
                if (args[0] == "find" && args[1]) {
                    api.findUser(args[1]).then(console.log);
                } else if (args[0] == "get") {
                    api.sendMessage(
                        {
                            msg: "hi",
                            attachments: [path.resolve("./test/a.png")],
                        },
                        message.threadId,
                        message.type,
                    ).then(console.log);
                }
            }
            break;

        case ThreadType.Group:
            if (!message.isSelf) {
                switch (message.data.content) {
                    case "ping": {
                        api.sendMessage("pong", message.threadId, message.type).then(console.log);
                        break;
                    }
                    default:
                        break;
                }
            }
            break;

        default:
            break;
    }
});

listener.start();
