import { appContext } from "../context.js";
import { API, Zalo } from "../index.js";
import { MessageType } from "../models/Message.js";
import { decodeAES, encodeAES, makeURL, request } from "../utils.js";
import { Sticker } from "./getStickers.js";

export function sendStickerFactory(api: API) {
    const directMessageServiceURL = makeURL(`${api.zpwServiceMap.chat[0]}/api/message/sticker`, {
        zpw_ver: Zalo.API_VERSION,
        zpw_type: Zalo.API_TYPE,
    });

    const groupMessageServiceURL = makeURL(`${api.zpwServiceMap.group[0]}/api/group/sticker`, {
        zpw_ver: Zalo.API_VERSION,
        zpw_type: Zalo.API_TYPE,
    });

    return async function sendSticker(sticker: Sticker, threadId: string, type: MessageType = MessageType.DirectMessage) {
        if (!appContext.secretKey) throw new Error("Secret key is not available");
        if (!appContext.imei) throw new Error("IMEI is not available");
        if (!appContext.cookie) throw new Error("Cookie is not available");
        if (!appContext.userAgent) throw new Error("User agent is not available");

        if (!sticker) throw new Error("Missing sticker");
        if (!threadId) throw new Error("Missing threadId");

        if (!sticker.id) throw new Error("Missing sticker id");
        if (!sticker.cateId) throw new Error("Missing sticker cateId");
        if (!sticker.type) throw new Error("Missing sticker type");

        const isGroupMessage = type === MessageType.GroupMessage;

        const params = {
            stickerId: sticker.id,
            cateId: sticker.cateId,
            type: sticker.type,
            clientId: Date.now(),
            imei: appContext.imei,
            zsource: 101,
            toid: isGroupMessage ? undefined : threadId,
            grid: isGroupMessage ? threadId : undefined,
        }

        const encryptedParams = encodeAES(appContext.secretKey, JSON.stringify(params));
        if (!encryptedParams) throw new Error("Failed to encrypt message");

        const finalServiceUrl = new URL(isGroupMessage ? groupMessageServiceURL : directMessageServiceURL);
        finalServiceUrl.searchParams.append("nretry", "0");

        const response = await request(finalServiceUrl.toString(), {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        if (!response.ok) throw new Error("Failed to send message: " + response.statusText);

        return decodeAES(appContext.secretKey, (await response.json()).data);
    };
}
