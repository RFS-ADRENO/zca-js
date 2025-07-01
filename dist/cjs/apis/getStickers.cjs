'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const getStickersFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.sticker}/api/message/sticker`);
    /**
     * Get stickers by keyword
     *
     * @param keyword Keyword to search for
     * @returns Sticker IDs
     *
     * @throws ZaloApiError
     */
    return async function getStickers(keyword) {
        if (!keyword)
            throw new ZaloApiError.ZaloApiError("Missing keyword");
        const params = {
            keyword: keyword,
            gif: 1,
            guggy: 0,
            imei: ctx.imei,
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt message");
        const finalServiceUrl = new URL(serviceURL);
        finalServiceUrl.pathname = finalServiceUrl.pathname + "/suggest/stickers";
        const response = await utils.request(utils.makeURL(finalServiceUrl.toString(), {
            params: encryptedParams,
        }));
        return utils.resolve(response, (result) => {
            const suggestions = result.data;
            const stickerIds = [];
            // @TODO: Implement these
            // suggestions.sugg_guggy, suggestions.sugg_gif
            if (suggestions.sugg_sticker)
                suggestions.sugg_sticker.forEach((sticker) => stickerIds.push(sticker.sticker_id));
            return stickerIds;
        });
    };
});

exports.getStickersFactory = getStickersFactory;
