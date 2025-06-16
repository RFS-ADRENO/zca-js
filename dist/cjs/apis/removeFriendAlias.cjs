'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const removeFriendAliasFactory = utils.apiFactory()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.alias[0]}/api/alias/remove`);
    /**
     * Remove friend's alias
     *
     * @param friendId friend id
     *
     * @throws ZaloApiError
     */
    return async function removeFriendAlias(friendId) {
        const params = {
            friendId: friendId,
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

exports.removeFriendAliasFactory = removeFriendAliasFactory;
