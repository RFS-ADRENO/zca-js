'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const blockViewFeedFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/feed/block`);
    /**
     * Block/Unblock friend view feed by ID
     *
     * @param userId User ID to block/unblock view feed
     * @param isBlockFeed Block/Unblock friend view feed (1 = true || 0 = false)
     *
     * @throws ZaloApiError
     */
    return async function blockViewFeed(userId, isBlockFeed = 1) {
        const params = {
            fid: userId,
            isBlockFeed: isBlockFeed,
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
