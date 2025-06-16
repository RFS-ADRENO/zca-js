import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory, resolveResponse } from "../utils.js";
export const getStickersDetailFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.sticker}/api/message/sticker`);
    /**
     * Get stickers detail by sticker IDs
     *
     * @param stickerIds Sticker IDs to search for
     *
     * @throws ZaloApiError
     */
    return async function getStickersDetail(stickerIds) {
        if (!stickerIds)
            throw new ZaloApiError("Missing sticker id");
        if (!Array.isArray(stickerIds))
            stickerIds = [stickerIds];
        if (stickerIds.length == 0)
            throw new ZaloApiError("Missing sticker id");
        const stickers = [];
        const tasks = stickerIds.map((stickerId) => getStickerDetail(stickerId));
        const tasksResult = await Promise.allSettled(tasks);
        tasksResult.forEach((result) => {
            if (result.status === "fulfilled")
                stickers.push(result.value);
        });
        return stickers;
    };
    async function getStickerDetail(stickerId) {
        const params = {
            sid: stickerId,
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError("Failed to encrypt message");
        const finalServiceUrl = new URL(serviceURL);
        finalServiceUrl.pathname = finalServiceUrl.pathname + "/sticker_detail";
        const response = await utils.request(utils.makeURL(finalServiceUrl.toString(), {
            params: encryptedParams,
        }));
        return resolveResponse(ctx, response);
    }
});
