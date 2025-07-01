'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const getBizAccountFactory = utils.apiFactory()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/friend/get-bizacc`);
    /**
     * Get biz account
     *
     * @param friendId The friend ID to get biz account
     *
     * @throws ZaloApiError
     */
    return async function getBizAccount(friendId) {
        const params = {
            fid: friendId,
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt params");
        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils.resolve(response);
    };
});

exports.getBizAccountFactory = getBizAccountFactory;
