import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type RejectFriendRequestResponse = "";

export const rejectFriendRequestFactory = apiFactory<RejectFriendRequestResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/reject`);

    /**
     * Reject a friend request from a User
     *
     * @param friendId The friend ID to user request is reject
     *
     * @throws {ZaloApiError}
     */
    return async function rejectFriendRequest(friendId: string) {
        const params = {
            fid: friendId,
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
