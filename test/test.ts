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
    console.log("Message:", message.data.toJSON());
    switch (message.type) {
        case "message":
            api.addReaction(":>", message.data).then(console.log);
            if (message.data.owner != api.getOwnId()) {
                switch (message.data.msg) {
                    case "reply": {
                        api.sendMessage("reply", message.data.owner, message.data).then(console.log);
                        break;
                    }
                    case "ping": {
                        api.sendMessage("pong", message.data.owner).then(console.log);
                        break;
                    }
                    default: {
                        break;
                    }
                }
            }
            break;
        
        case "group_message":
            break;

        default: break;
    }
});

listener.start();
