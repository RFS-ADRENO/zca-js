'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const getRecommendRequestFactory = utils.apiFactory()((api, ctx, utils) => {
    const services2URL = utils.makeURL(`${api.zpwServiceMap.friend[1]}/api/friend/recommendsv2/list`);
    /**
     * Get friend requests
     *
     * @throws ZaloApiError
     */
    return async function getRecommendRequest() {
        const params = {
            imei: ctx.imei,
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt params");
        const response2 = await utils.request(utils.makeURL(services2URL, { params: encryptedParams }), {
            method: "GET",
        });
        return utils.resolve(response2);
    };
});

exports.getRecommendRequestFactory = getRecommendRequestFactory;
