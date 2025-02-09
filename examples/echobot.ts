import fs from "node:fs";
import { API, Credentials, ThreadType, Zalo } from "../src/index.js";

const zalo = new Zalo();

const credentials: Partial<Credentials> = {
    cookie: JSON.parse(fs.readFileSync("./examples/cookies.json", "utf-8")),
    imei: "",
    userAgent: "", // Same userAgent is recommended
};

const isValid = (credentials: Partial<Credentials>): credentials is Credentials => {
    return !!credentials.cookie && !!credentials.imei && !!credentials.userAgent;
};

let api: API | undefined;

if (isValid(credentials)) {
    api = await zalo.login(credentials);
} else {
    api = await zalo.loginQR({ qrPath: "./qr.png", userAgent: "" }, () => {
        console.log("QR Code has been generated");
    });
    const context = api.getContext();

    // Save credentials for later use
    credentials.imei = context.imei;
    credentials.userAgent = context.userAgent;
    credentials.cookie = context.cookie.toJSON()?.cookies;
}

const { listener } = api;

listener.on("message", (message) => {
    const isDirectMessage = message.type === ThreadType.User;

    if (isDirectMessage && !message.isSelf && typeof message.data.content === "string") {
        console.log("Message:", message.data.content, message.threadId);
        api.sendMessage(message.data.content, message.threadId, message.type);
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
