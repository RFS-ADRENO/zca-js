'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const acceptFriendRequestFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/accept`);
    /**
     * Accept a friend request from a User
     *
     * @param userId The User ID to friend request is accept
     *
     * @throws ZaloApiError
     */
    return async function acceptFriendRequest(userId) {
        const params = {
            fid: userId,
            language: ctx.language,
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

exports.acceptFriendRequestFactory = acceptFriendRequestFactory;
