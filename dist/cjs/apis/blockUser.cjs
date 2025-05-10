'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const blockUserFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/block`);
    /**
     * Block a User
     *
     * @param userId The ID of the User to block
     *
     * @throws ZaloApiError
     */
    return async function blockUser(userId) {
        const params = {
            fid: userId,
            imei: ctx.imei,
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

exports.blockUserFactory = blockUserFactory;
