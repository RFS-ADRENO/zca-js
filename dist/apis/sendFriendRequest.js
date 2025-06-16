import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";
export const sendFriendRequestFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/sendreq`);
    /**
     * Send a friend request to a user.
     *
     * @param msg message sent with friend request
     * @param userId User ID to send friend request to
     *
     * @throws ZaloApiError
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
            throw new ZaloApiError("Failed to encrypt params");
        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils.resolve(response);
    };
});
