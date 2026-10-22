# ZCA-JS (Forked Version)

> [!NOTE]
> **This is a forked version of the original [zca-js](https://github.com/RFS-ADRENO/zca-js) project by RFS-ADRENO.** This package (`@softtynet/zca-js`) is maintained separately for quick hotfixes.
> 
> This is an unofficial Zalo API for personal account. It work by simulating the browser to interact with Zalo Web.

> [!WARNING]
> Using this API could get your account locked or banned. We are not responsible for any issues that may happen. Use it at your own risk.

---

## Table of Contents

-   [Installation](#installation)
    - [Migrate to V2](#migrate-to-v2)
-   [Documentation](#documentation)
-   [Basic Usages](#basic-usages)
    -   [Login](#login)
    -   [Listen for new messages](#listen-for-new-messages)
    -   [Synchronize Messages from Mobile](#synchronize-messages-from-mobile)
    -   [Send a message](#send-a-message)
    -   [Get/Send a sticker](#getsend-a-sticker)
-   [Example](#example)
-   [Projects & Useful Resources](#projects--useful-resources)
-   [Contributing](#contributing)
-   [License](#license)
-   [Support Us](#support-us)

## Installation

```bash
bun add zca-js # or npm install zca-js
```

### Migrate to V2

Since official version 2.0.0, `zca-js` has removed sharp dependency for image metadata extraction. It now requires users to provide their own `imageMetadataGetter` function when initializing the `Zalo` class if they want to send images/gifs by file path.

Example of custom `imageMetadataGetter` using `sharp`:

```bash
bun add sharp # or npm install sharp
```

```javascript
import { Zalo } from "zca-js";
import sharp from "sharp";
import fs from "node:fs";

async function imageMetadataGetter(filePath) {
    const data = await fs.promises.readFile(filePath);
    const metadata = await sharp(data).metadata();
    return {
        height: metadata.height,
        width: metadata.width,
        size: metadata.size || data.length,
    };
}

const zalo = new Zalo({
    imageMetadataGetter,
});
```

---

## Documentation

See [API Documentation](https://zca-js.tdung.com) for more details.

---

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

> [!IMPORTANT]
> Only one web listener can run per account at a time. If you open Zalo in the browser while the listener is active, the listener will be automatically stopped.

### Synchronize Messages from Mobile

`zca-js` supports cross-device message synchronization from the official Zalo mobile app:

#### Case 1: Auto-Sync on QR Login
When logging in via `loginQR`, check the **"Sync message with your phone"** checkbox on your phone before confirming:

```javascript
import { Zalo, LoginQRCallbackEventType } from "zca-js";

const zalo = new Zalo({ selfListen: true });
const api = await zalo.loginQR({ qrPath: "./qr.png" });

// Listen for historical messages pushed from phone
api.listener.on("old_messages", (messages, type) => {
    console.log(`Received ${messages.length} historical synced messages!`);
});

api.listener.start();
```

#### Case 2: Manual Trigger Sync (from existing session)
To request message synchronization from your phone at any time:

```javascript
api.listener.on("connected", async () => {
    // Send sync request signal to mobile phone
    await api.requestSyncFromPhone();
    console.log("Please tap 'Sync now' on your phone!");
});

api.listener.on("old_messages", (messages, type) => {
    console.log(`Received ${messages.length} synced messages from phone!`);
});

api.listener.start();
```

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
                    quote: message.data, // the message to reply to (optional)
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
                    quote: message.data, // the message to reply to (optional)
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

---

## Example

See [examples](examples) folder for more details.

---

## Projects & Useful Resources

<div align="center">

| Repository | Description |
|    :---    |    :---     |
| [**ZaloDataExtractor**](https://github.com/JustKemForFun/ZaloDataExtractor) | A browser `Extension` to extract IMEI, cookies, and user agent from Zalo Web. |
| [**MultiZlogin**](https://github.com/ChickenAI/multizlogin) | A multi-account Zalo management system that lets you log in to and manage multiple accounts simultaneously, with proxy and webhook integration. |
| [**n8n-nodes-zalo-tools**](https://github.com/ChickenAI/zalo-node) | N8N node for personal Zalo account. |
| [**Zalo-F12**](https://github.com/ElectroHeavenVN/Zalo-F12) | A collection of JavaScript code snippets to paste into DevTools to change how Zalo Web/PC works. |
| [**Zalo-F12-Tools**](https://github.com/JustKemForFun/Zalo-F12-Tools) | Toggle hidden modes for Zalo Web. |

</div>

---

## Contributing

We welcome contributions from the community! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to:

- 🐛 Report bugs and issues
- ✨ Suggest new features
- 🔧 Submit code contributions
- 📚 Improve documentation
- 🧪 Add or improve tests
- 🔒 Report security vulnerabilities

For more information, please read our [Code of Conduct](CODE_OF_CONDUCT.md) and [Security Policy](SECURITY.md) before participating.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## **Support Us**

- ⭐ **Star our repositories** if you find them useful!  
- 🔄 **Share** with your network to help us grow  
- 💡 **Contribute** your ideas and code    
- ☕ **A coffee**:
    - [Buy Me a Coffee](https://ko-fi.com/grosse)
    - [Paypal](https://www.paypal.com/paypalme/dungto213)
    - [VietQR](https://github.com/user-attachments/assets/e1f319d6-9d11-4082-8248-55b55e645caa)
    - [Momo](https://me.momo.vn/gMIMulsaUqsbf6iAiXt3)
