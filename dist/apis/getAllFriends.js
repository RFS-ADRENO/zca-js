import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";
export const getAllFriendsFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/friend/getfriends`);
    /**
     * Get all friends
     *
     * @param count Page size (default: 20000)
     * @param page Page number (default: 1)
     *
     * @throws ZaloApiError
     */
    return async function getAllFriends(count = 20000, page = 1) {
        const params = {
            incInvalid: 1,
            page,
            count,
            avatar_size: 120,
            actiontime: 0,
            imei: ctx.imei,
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError("Failed to encrypt message");
        const response = await utils.request(utils.makeURL(serviceURL, {
            params: encryptedParams,
        }), {
            method: "GET",
        });
        return utils.resolve(response);
    };
});
