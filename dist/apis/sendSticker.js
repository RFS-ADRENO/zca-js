import { ThreadType } from "../models/index.js";
import { apiFactory, removeUndefinedKeys } from "../utils.js";
import { ZaloApiError } from "../Errors/ZaloApiError.js";
export const sendStickerFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = {
        [ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.chat[0]}/api/message/sticker`, {
            nretry: "0",
        }),
        [ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/sticker`, {
            nretry: "0",
        }),
    };
    /**
     * Send a sticker to a thread
     *
     * @param sticker Sticker object
     * @param threadId group or user id
     * @param type Message type (User or GroupMessage)
     *
     * @throws ZaloApiError
     */
    return async function sendSticker(sticker, threadId, type = ThreadType.User) {
        if (!sticker)
            throw new ZaloApiError("Missing sticker");
        if (!threadId)
            throw new ZaloApiError("Missing threadId");
        if (!sticker.id)
            throw new ZaloApiError("Missing sticker id");
        if (!sticker.cateId)
            throw new ZaloApiError("Missing sticker cateId");
        if (!sticker.type)
            throw new ZaloApiError("Missing sticker type");
        const isGroupMessage = type === ThreadType.Group;
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
        removeUndefinedKeys(params);
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError("Failed to encrypt message");
        const response = await utils.request(serviceURL[type].toString(), {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils.resolve(response);
    };
});
