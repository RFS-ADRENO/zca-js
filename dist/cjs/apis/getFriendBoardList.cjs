'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const getFriendBoardListFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend_board[0]}/api/friendboard/list`);
    /**
     * Get friend board list
     *
     * @param conversationId conversation id
     *
     * @throws ZaloApiError
     */
    return async function getFriendBoardList(conversationId) {
        const params = {
            conversationId: conversationId,
            version: 0,
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

exports.getFriendBoardListFactory = getFriendBoardListFactory;
