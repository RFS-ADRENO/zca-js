# ZCA-JS

This is an unofficial Zalo API for personal account. It work by simulating the browser to interact with Zalo Web.

**Warning**: Using this API could get your account locked or banned. We are not responsible for any issues that may happen. Use it at your own risk.

## Installation

```bash
bun install zca-js # or npm install zca-js
```

## Documentation

See [API Documentation](https://zca.tdung.co/) for more details.

## Basic Usages

### Login

```javascript
import { Zalo } from "zca-js";

const zalo = new Zalo();
const api = await zalo.loginQR();
```

### Listen for new messages

```javascript
import { Zalo, ThreadType } from "zca-js";

const zalo = new Zalo();
const api = await zalo.loginQR();

api.listener.on("message", (message) => {
    const isPlainText = typeof message.data.content === "string";

    switch (message.type) {
        case ThreadType.User: {
            if (isPlainText) {
                // received plain text direct message
            }
            break;
        }
        case ThreadType.Group: {
            if (isPlainText) {
                // received plain text group message
            }
            break;
        }
    }
});

api.listener.start();
```

**Note**: Only one web listener can run per account at a time. If you open Zalo in the browser while the listener is active, the listener will be automatically stopped.

### Send a message

```javascript
import { Zalo, ThreadType } from "zca-js";

const zalo = new Zalo();
const api = await zalo.loginQR();

// Echo bot
api.listener.on("message", (message) => {
    const isPlainText = typeof message.data.content === "string";
    if (message.isSelf || !isPlainText) return;

    switch (message.type) {
        case ThreadType.User: {
            api.sendMessage(
                {
                    msg: "echo: " + message.data.content,
                    quote: message, // the message object to reply to (optional)
                },
                message.threadId,
                message.type, // ThreadType.User
            );
            break;
        }
        case ThreadType.Group: {
            api.sendMessage(
                {
                    msg: "echo: " + message.data.content,
                    quote: message, // the message object to reply to (optional)
                },
                message.threadId,
                message.type, // ThreadType.Group
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
        message.type, // ThreadType.User or ThreadType.Group
    );
});
```

## Example

See [examples](examples) folder for more details.

## Contributing

We welcome contributions from the community.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
