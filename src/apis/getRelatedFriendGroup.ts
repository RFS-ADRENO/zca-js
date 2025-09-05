import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetRelatedFriendGroupResponse = {
    groupRelateds: {
        [friendId: string]: string[];
    };
};

export const getRelatedFriendGroupFactory = apiFactory<GetRelatedFriendGroupResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/group/related`);

    /**
     * Get related friend group
     *
     * @param friendId friend ids
     *
     * @note this API is used for zBusiness
     * @throws ZaloApiError
     */
    return async function getRelatedFriendGroup(friendId: string | string[]) {
        const friendIds = Array.isArray(friendId) ? friendId : [friendId];

        const params = {
            friend_ids: JSON.stringify(friendIds),
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
