import { appContext } from "../context.js";
import { MessageType } from "../models/Message.js";
import { encodeAES, handleZaloResponse, makeURL, request } from "../utils.js";
import { StickerDetailResponse } from "./getStickersDetail.js";

import type { API } from "../zalo.js";
import { ZaloApiError } from "../Errors/ZaloApiError.js";

export type SendStickerResponse = {
    msgId: number;
};

export function sendStickerFactory(api: API) {
    const directMessageServiceURL = makeURL(`${api.zpwServiceMap.chat[0]}/api/message/sticker`, {
        zpw_ver: appContext.API_VERSION,
        zpw_type: appContext.API_TYPE,
    });

    const groupMessageServiceURL = makeURL(`${api.zpwServiceMap.group[0]}/api/group/sticker`, {
        zpw_ver: appContext.API_VERSION,
        zpw_type: appContext.API_TYPE,
    });

    /**
     * Send a sticker to a thread
     *
     * @param sticker Sticker object
     * @param threadId group or user id
     * @param type Message type (DirectMessage or GroupMessage)
     *
     * @throws ZaloApiError
     */
    return async function sendSticker(
        sticker: StickerDetailResponse,
        threadId: string,
        type: MessageType = MessageType.DirectMessage,
    ) {
        if (!appContext.secretKey) throw new ZaloApiError("Secret key is not available");
        if (!appContext.imei) throw new ZaloApiError("IMEI is not available");
        if (!appContext.cookie) throw new ZaloApiError("Cookie is not available");
        if (!appContext.userAgent) throw new ZaloApiError("User agent is not available");

        if (!sticker) throw new ZaloApiError("Missing sticker");
        if (!threadId) throw new ZaloApiError("Missing threadId");

        if (!sticker.id) throw new ZaloApiError("Missing sticker id");
        if (!sticker.cateId) throw new ZaloApiError("Missing sticker cateId");
        if (!sticker.type) throw new ZaloApiError("Missing sticker type");

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
        };

        const encryptedParams = encodeAES(appContext.secretKey, JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt message");

        const finalServiceUrl = new URL(isGroupMessage ? groupMessageServiceURL : directMessageServiceURL);
        finalServiceUrl.searchParams.append("nretry", "0");

        const response = await request(finalServiceUrl.toString(), {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        const result = await handleZaloResponse<SendStickerResponse>(response);
        if (result.error) throw new ZaloApiError(result.error.message, result.error.code);

        return result.data as SendStickerResponse;
    };
}
