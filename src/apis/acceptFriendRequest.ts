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

// Let me ask about the function of the acceptFriendRequest() hook.
// I did it through the login section (I got a message from another user to a logged-in user)
// however, when another user sends a friend invitation, I haven't gotten the userId from the person who sent the friend action.
// Currently only retrieved in api.listener.on("message", (message) => { //TODO}
// very much looking forward to the suggestion from the owner himself.
