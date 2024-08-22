import { appContext } from "../context.js";
import { Zalo, ZaloApiError } from "../index.js";
import { GroupMessage, Message, MessageType } from "../models/Message.js";
import { encodeAES, handleZaloResponse, request } from "../utils.js";

export type UndoResponse = {
    status: number;
};

export function undoFactory() {
    const URLType = {
        [MessageType.DirectMessage]: `https://tt-chat2-wpa.chat.zalo.me/api/message/undo?zpw_ver=${Zalo.API_VERSION}&zpw_type=${Zalo.API_TYPE}`,
        [MessageType.GroupMessage]: `https://tt-group-wpa.chat.zalo.me/api/group/undomsg?zpw_ver=${Zalo.API_VERSION}&zpw_type=${Zalo.API_TYPE}`,
    };
    /**
     * Undo a message
     *
     * @param message Message or GroupMessage instance
     *
     * @throws ZaloApiError
     */
    return async function undo(message: Message | GroupMessage) {
        if (!appContext.secretKey) throw new ZaloApiError("Secret key is not available");
        if (!appContext.imei) throw new ZaloApiError("IMEI is not available");
        if (!appContext.cookie) throw new ZaloApiError("Cookie is not available");
        if (!appContext.userAgent) throw new ZaloApiError("User agent is not available");

        if (!message.data.quote) throw new ZaloApiError("Message does not have quote");
        if (message instanceof Message && message.data.uidFrom !== String(message.data.quote.ownerId))
            throw new ZaloApiError("You can only undo your own messages");

        const params: any = {
            msgId: message.data.quote.globalMsgId,
            clientId: Date.now(),
            cliMsgIdUndo: message.data.quote.cliMsgId,
        };

        if (message instanceof GroupMessage) {
            params["grid"] = message.threadId;
            params["visibility"] = 0;
            params["imei"] = appContext.imei;
        } else params["toid"] = message.threadId;

        const encryptedParams = encodeAES(appContext.secretKey, JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt message");

        const response = await request(URLType[message.type], {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        const result = await handleZaloResponse<UndoResponse>(response);
        if (result.error) throw new ZaloApiError(result.error.message, result.error.code);

        return result.data as UndoResponse;
    };
}
