import { MessageType } from "../models/Message.js";
import { apiFactory, encodeAES, makeURL, request } from "../utils.js";
import type { StickerDetailResponse } from "./getStickersDetail.js";

import { ZaloApiError } from "../Errors/ZaloApiError.js";

export type SendStickerResponse = {
    msgId: number;
};

export const sendStickerFactory = apiFactory<SendStickerResponse>()((api, ctx, resolve) => {
    const directMessageServiceURL = makeURL(`${api.zpwServiceMap.chat[0]}/api/message/sticker`);
    const groupMessageServiceURL = makeURL(`${api.zpwServiceMap.group[0]}/api/group/sticker`);

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
            imei: ctx.imei,
            zsource: 101,
            toid: isGroupMessage ? undefined : threadId,
            grid: isGroupMessage ? threadId : undefined,
        };

        const encryptedParams = encodeAES(ctx.secretKey, JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt message");

        const finalServiceUrl = new URL(isGroupMessage ? groupMessageServiceURL : directMessageServiceURL);
        finalServiceUrl.searchParams.append("nretry", "0");

        const response = await request(finalServiceUrl.toString(), {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return resolve(response);
    };
});
