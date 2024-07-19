import { Zalo } from "../src/index.js";
const zalo = new Zalo({
    cookie: "",
    imei: "",
    userAgent: "",
    language: "vi",
});

const api = await zalo.login();
const listener = new api.Listener({ selfListen: true });

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
    console.log("Message:", message.toJSON());
    if (message.owner != api.getOwnId()) {
        switch (message.msg) {
            case "reply": {
                api.sendMessage("reply", message.owner, message).then(console.log);
                break;
            }
            case "ping": {
                api.sendMessage("pong", message.owner).then(console.log);
                break;
            }
            default: {
                break;
            }
        }
    }
});

listener.start();
