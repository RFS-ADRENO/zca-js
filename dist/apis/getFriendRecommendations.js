import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";
export var FriendRecommendationsType;
(function (FriendRecommendationsType) {
    FriendRecommendationsType[FriendRecommendationsType["RecommendedFriend"] = 1] = "RecommendedFriend";
    FriendRecommendationsType[FriendRecommendationsType["ReceivedFriendRequest"] = 2] = "ReceivedFriendRequest";
})(FriendRecommendationsType || (FriendRecommendationsType = {}));
export const getFriendRecommendationsFactory = apiFactory()((api, ctx, utils) => {
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
            throw new ZaloApiError("Failed to encrypt params");
        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });
        return utils.resolve(response);
    };
});
