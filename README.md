# ZCA-JS

This is an unofficial Zalo API for personal account. It work by simulating the browser to interact with Zalo Web.

**disclaimer**: We are not responsible if your account is locked or banned by Zalo. Use it at your own risk.

## Installation

```bash
bun install zca-js # or npm install zca-js
```

## Documentation

See [API Documentation](https://zca.tdung.co/) for more details.

## Basic Usages

### Login

**UPDATE**: You can now get all required information by using [ZaloDataExtractor](https://github.com/JustKemForFun/ZaloDataExtractor) extension. Just open the extension and copy the data to your clipboard.

```javascript
import { Zalo } from "zca-js";

const zalo = new Zalo(
    {
        cookie: "your_cookie_here",
        imei: "your_imei_here",
        userAgent: "your_user_agent_here",
    },
    {
        selfListen: false,
        checkUpdate: true,
    },
);

const api = await zalo.login();
```

**Alternative**: We also support [J2TEAM Cookies](https://chromewebstore.google.com/detail/j2team-cookies/okpidcojinmlaakglciglbpcpajaibco) extension:

```javascript
import { Zalo } from "zca-js";

const zalo = new Zalo(
    {
        cookie: JSON.parse(fs.readFileSync("./cookies.json", "utf-8")),
        imei: "your_imei_here",
        userAgent: "your_user_agent_here",
    },
    {
        selfListen: false,
        checkUpdate: true,
    },
);

const api = await zalo.login();
```

-   `cookie`: Your Zalo cookie. You can get it by using [J2TEAM Cookies](https://chromewebstore.google.com/detail/j2team-cookies/okpidcojinmlaakglciglbpcpajaibco) extension or by using browser developer tools.
-   `imei`: Your IMEI created by Zalo. You can get it using browser developer tools: `localStorage.getItem('z_uuid')` or `localStorage.getItem('sh_z_uuid')`.
-   `userAgent`: Your browser user agent. Better be from the same browser you get cookie.
-   `selfListen`: Listen for messages sent by yourself. Default is `false`.
-   `checkUpdate`: Check for zca-js update. Default is `true`.

### Listen for new messages

```javascript
import { Zalo, MessageType } from "zca-js";

const zalo = new Zalo(credentials);
const api = await zalo.login();

api.listener.on("message", (message) => {
    const isPlainText = typeof message.data.content === "string";

    switch (message.type) {
        case MessageType.DirectMessage: {
            if (isPlainText) {
                // received plain text direct message
            }
            break;
        }
        case MessageType.GroupMessage: {
            if (isPlainText) {
                // received plain text group message
            }
            break;
        }
    }
});

api.listener.start();
```

**Note**: Only one web listener can be started at a time. If you open `Zalo` in the browser while the listener is running, the listener will be stopped.

### Send a message

```javascript
import { Zalo, MessageType } from "zca-js";

const zalo = new Zalo(credentials);
const api = await zalo.login();

// Echo bot
api.listener.on("message", (message) => {
    const isPlainText = typeof message.data.content === "string";
    if (message.isSelf || !isPlainText) return;

    switch (message.type) {
        case MessageType.DirectMessage: {
            api.sendMessage(
                {
                    msg: "echo: " + message.data.content,
                    quote: message, // the message object to reply to (optional)
                },
                message.threadId,
                message.type, // MessageType.DirectMessage
            );
            break;
        }
        case MessageType.GroupMessage: {
            api.sendMessage(
                {
                    msg: "echo: " + message.data.content,
                    quote: message, // the message object to reply to (optional)
                },
                message.threadId,
                message.type, // MessageType.GroupMessage
            );
            break;
        }
    }
});

api.listener.start();
```

### Get/Send a sticker

```javascript
api.getStickers("hello").then(async (stickerIds) => {
    // Get the first sticker
    const stickerObject = await api.getStickersDetail(stickerIds[0]);
    api.sendMessageSticker(
        stickerObject,
        message.threadId,
        message.type, // MessageType.DirectMessage or MessageType.GroupMessage
    );
});
```

## Example

See [examples](examples) folder for more details.

## Contributing

We welcome contributions from the community.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
