'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const searchStickerFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.sticker[0]}/api/message/sticker/search`);
    /**
     * Search stickers
     *
     * @param keyword Keyword to search stickers
     * @param limit Limit of stickers to return (default: 50)
     *
     * @throws {ZaloApiError}
     */
    return async function searchSticker(keyword, limit = 50) {
        const params = {
            keyword: keyword,
            limit: limit,
            srcType: 0,
            imei: ctx.imei,
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt params");
        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });
        return utils.resolve(response);
    };
});

exports.searchStickerFactory = searchStickerFactory;
