'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const updateActiveStatusFactory = utils.apiFactory()((api, ctx, utils) => {
    const pingURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/profile/ping`);
    const deactiveURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/profile/deactive`);
    /**
     * Update active status?
     *
     * @param active
     *
     * @throws {ZaloApiError}
     */
    return async function updateActiveStatus(active) {
        const params = {
            status: active ? 1 : 0,
            imei: ctx.imei,
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt params");
        const targetURL = active ? pingURL : deactiveURL;
        const response = await utils.request(utils.makeURL(targetURL, { params: encryptedParams }), {
            method: "GET",
        });
        return utils.resolve(response);
    };
});

exports.updateActiveStatusFactory = updateActiveStatusFactory;
