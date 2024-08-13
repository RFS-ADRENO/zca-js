import { Zalo } from "../src/index.js";
import { MessageType } from "../src/models/Message.js";
const zalo = new Zalo({
    cookie: "",
    imei: "",
    userAgent: "",
    language: "vi",
});

const api = await zalo.login();
const { listener } = api;

listener.onConnected(() => {
    console.log("Connected");
});

listener.onClosed(() => {
    console.log("Closed");
});

listener.onError((error: any) => {
    console.error("Error:", error);
});

listener.onMessage((message) => {
    console.log("Message:", message.data);
    switch (message.type) {
        case MessageType.Message:
            api.addReaction(":>", message).then(console.log);
            if (message.data.uidFrom != api.getOwnId()) {
                switch (message.data.content) {
                    case "reply": {
                        api.sendMessage("reply", message.data.uidFrom, message).then(console.log);
                        break;
                    }
                    case "ping": {
                        api.sendMessage("pong", message.data.uidFrom).then(console.log);
                        break;
                    }
                    default: {
                        const args = message.data.content.split(/\s+/);
                        if (args[0] == "sticker" && args[1]) {
                            api.getStickers(args[1]).then((stickers) => {
                                const { sticker } = stickers.suggestions;
                                const random = sticker[Math.floor(Math.random() * sticker.length)];
                                console.log("Sending sticker:", random);

                                if (random)
                                    api.sendSticker(random, message.data.uidFrom).then(console.log);
                                else
                                    api.sendMessage("No sticker found", message.data.uidFrom).then(
                                        console.log
                                    );
                            });
                        }
                        break;
                    }
                }
            } else {
                const args = message.data.content.split(/\s+/);
                if (args[0] == "find" && args[1]) {
                    api.findUser(args[1]).then(console.log);
                }
            }
            break;

        case MessageType.GroupMessage:
            break;

        default:
            break;
    }
});

listener.start();
