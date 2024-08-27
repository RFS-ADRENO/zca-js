import { appContext } from "../context.js";
import { API, Zalo, ZaloApiError } from "../index.js";
import { GroupMessage, Message, MessageType } from "../models/Message.js";
import { encodeAES, handleZaloResponse, request } from "../utils.js";

export type UndoResponse = {
    status: number;
};

export function undoFactory(api: API) {
    const URLType = {
        [MessageType.DirectMessage]: `${api.zpwServiceMap.chat[0]}/api/message/undo?zpw_ver=${Zalo.API_VERSION}&zpw_type=${Zalo.API_TYPE}`,
        [MessageType.GroupMessage]: `${api.zpwServiceMap.group[0]}/api/group/undomsg?zpw_ver=${Zalo.API_VERSION}&zpw_type=${Zalo.API_TYPE}`,
    };
    /**
     * Undo a message
     *
     * @param message Message or GroupMessage instance that has quote to undo
     *
     * @throws ZaloApiError
     */
    return async function undo(message: Message | GroupMessage) {
        if (!appContext.secretKey) throw new ZaloApiError("Secret key is not available");
        if (!appContext.imei) throw new ZaloApiError("IMEI is not available");
        if (!appContext.cookie) throw new ZaloApiError("Cookie is not available");
        if (!appContext.userAgent) throw new ZaloApiError("User agent is not available");

        if (!(message instanceof Message) && !(message instanceof GroupMessage))
            throw new ZaloApiError(
                "Expected Message or GroupMessage instance, got: " + (message as unknown as any)?.constructor?.name,
            );
        if (!message.data.quote) throw new ZaloApiError("Message does not have quote");

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
