'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

exports.FriendRecommendationsType = void 0;
(function (FriendRecommendationsType) {
    FriendRecommendationsType[FriendRecommendationsType["RecommendedFriend"] = 1] = "RecommendedFriend";
    FriendRecommendationsType[FriendRecommendationsType["ReceivedFriendRequest"] = 2] = "ReceivedFriendRequest";
})(exports.FriendRecommendationsType || (exports.FriendRecommendationsType = {}));
const getFriendRecommendationsFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/recommendsv2/list`);
    /**
     * Get friend recommendations/received friend requests
     *
     * @throws {ZaloApiError}
     */
    return async function getFriendRecommendations() {
        const params = {
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

exports.getFriendRecommendationsFactory = getFriendRecommendationsFactory;
