'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const blockViewFeedFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/feed/block`);
    /**
     * Block/Unblock friend view feed by ID
     *
     * @param isBlockFeed Boolean to block/unblock view feed
     * @param userId User ID to block/unblock view feed
     *
     * @throws {ZaloApiError}
     */
    return async function blockViewFeed(isBlockFeed, userId) {
        const params = {
            fid: userId,
            isBlockFeed: isBlockFeed ? 1 : 0,
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

exports.blockViewFeedFactory = blockViewFeedFactory;
