import { appContext } from "../context.js";
import { Message, GroupMessage, MessageType } from "../models/Message.js";
import { decodeAES, encodeAES, request } from "../utils.js";
import { Zalo } from "../index.js";


export function undoFactory() {
    const URLType = {
        [MessageType.DirectMessage]: `https://tt-chat2-wpa.chat.zalo.me/api/message/undo?zpw_ver=${Zalo.API_VERSION}&zpw_type=${Zalo.API_TYPE}`,
        [MessageType.GroupMessage]: `https://tt-group-wpa.chat.zalo.me/api/group/undomsg?zpw_ver=${Zalo.API_VERSION}&zpw_type=${Zalo.API_TYPE}`
    }
    return async function undo(message: Message | GroupMessage) {
        if (!appContext.secretKey) throw new Error("Secret key is not available");
        if (!appContext.imei) throw new Error("IMEI is not available");
        if (!appContext.cookie) throw new Error("Cookie is not available");
        if (!appContext.userAgent) throw new Error("User agent is not available");

        if (!message.data.quote) throw new Error("Message does not have quote");
        if (message instanceof Message && message.data.uidFrom !== String(message.data.quote.ownerId)) throw new Error("You can only undo your own messages");

        const params: any = {
            msgId: message.data.quote.globalMsgId,
            clientId: Date.now(),
            cliMsgIdUndo: message.data.quote.cliMsgId
        }

        if (message instanceof GroupMessage) {
            params["grid"] = message.threadId;
            params["visibility"] = 0;
            params["imei"] = appContext.imei;
        } else params["toid"] = message.threadId;

        const encryptedParams = encodeAES(appContext.secretKey, JSON.stringify(params));
        if (!encryptedParams) throw new Error("Failed to encrypt message");

        const response = await request(URLType[message.type], {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        if (!response.ok) throw new Error("Failed to send message: " + response.statusText);

        return decodeAES(appContext.secretKey, (await response.json()).data);
    }
}
