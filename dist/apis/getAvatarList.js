import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";
export const getAvatarListFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/avatar-list`);
    /**
     * Get avatar list
     *
     * @param count The number of avatars to fetch (default: 50)
     * @param page The page number to fetch (default: 1)
     *
     * @throws {ZaloApiError}
     */
    return async function getAvatarList(count = 50, page = 1) {
        const params = {
            page,
            albumId: "0",
            count,
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
