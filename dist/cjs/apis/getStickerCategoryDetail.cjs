'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const getStickerCategoryDetailFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.sticker[0]}/api/message/sticker/category/sticker_detail`);
    /**
     * Get sticker category detail
     *
     * @param cateId Sticker category ID
     *
     * @throws {ZaloApiError}
     */
    return async function getStickerCategoryDetail(cateId) {
        const params = {
            cid: cateId,
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

exports.getStickerCategoryDetailFactory = getStickerCategoryDetailFactory;
