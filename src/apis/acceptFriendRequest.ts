import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type AcceptFriendRequestResponse = "";

export const acceptFriendRequestFactory = apiFactory<AcceptFriendRequestResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/accept`);

    /**
     * Accept a friend request from a User
     *
     * @param userId The User ID to friend request is accept
     *
     * @throws ZaloApiError
     */
    return async function acceptFriendRequest(userId: string) {
        const params = {
            fid: userId,
            language: ctx.language,
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
