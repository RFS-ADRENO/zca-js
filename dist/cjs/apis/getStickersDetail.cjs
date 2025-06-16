'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const getStickersDetailFactory = utils.apiFactory()((api, ctx, utils$1) => {
    const serviceURL = utils$1.makeURL(`${api.zpwServiceMap.sticker}/api/message/sticker`);
    /**
     * Get stickers detail by sticker IDs
     *
     * @param stickerIds Sticker IDs to search for
     *
     * @throws ZaloApiError
     */
    return async function getStickersDetail(stickerIds) {
        if (!stickerIds)
            throw new ZaloApiError.ZaloApiError("Missing sticker id");
        if (!Array.isArray(stickerIds))
            stickerIds = [stickerIds];
        if (stickerIds.length == 0)
            throw new ZaloApiError.ZaloApiError("Missing sticker id");
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
        const encryptedParams = utils$1.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt message");
        const finalServiceUrl = new URL(serviceURL);
        finalServiceUrl.pathname = finalServiceUrl.pathname + "/sticker_detail";
        const response = await utils$1.request(utils$1.makeURL(finalServiceUrl.toString(), {
            params: encryptedParams,
        }));
        return utils.resolveResponse(ctx, response);
    }
});

exports.getStickersDetailFactory = getStickersDetailFactory;
