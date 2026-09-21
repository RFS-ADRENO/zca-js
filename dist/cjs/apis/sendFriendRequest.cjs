'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const sendFriendRequestFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/sendreq`);
    /**
     * Send a friend request to a user.
     *
     * @param msg message sent with friend request
     * @param userId User ID to send friend request to
     *
     * @note Zalo might throw an error with code 225 if the user is already friends with you,
     *          215 if the user might have blocked you,
     *          222 if user has already sent you a friend request, your request will be treated as acceptance instead.
     *
     * @throws {ZaloApiError}
     */
    return async function sendFriendRequest(msg, userId) {
        const params = {
            toid: userId,
            msg: msg,
            reqsrc: 30,
            imei: ctx.imei,
            language: ctx.language,
            srcParams: JSON.stringify({
                uidTo: userId,
            }),
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

exports.sendFriendRequestFactory = sendFriendRequestFactory;
