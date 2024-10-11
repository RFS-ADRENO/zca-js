import fs from "node:fs";
import { J2Cookies, Zalo } from "../src/index.js";
import { MessageType } from "../src/models/Message.js";
const zalo = new Zalo({
    cookie: JSON.parse(fs.readFileSync("./examples/cookies.json", "utf-8")) as J2Cookies,
    imei: "",
    userAgent: "",
});

const api = await zalo.login();
const { listener } = api;

listener.on("message", (message) => {
    const isDirectMessage = message.type === MessageType.DirectMessage;

    if (isDirectMessage && !message.isSelf && typeof message.data.content === "string") {
        console.log("Message:", message.data.content, message.threadId);
        api.sendMessage(message.data.content, message.threadId, message.type, message);
    }
});

listener.onConnected(() => {
    console.log("Connected");
});

listener.onClosed(() => {
    console.log("Closed");
});

listener.onError((error: any) => {
    console.error("Error:", error);
});

listener.start();
