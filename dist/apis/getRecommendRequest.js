import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";
export const getRecommendRequestFactory = apiFactory()((api, ctx, utils) => {
    const services2URL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/recommendsv2/list`);
    /**
     * Get friend requests
     *
     * @throws ZaloApiError
     */
    return async function getRecommendRequest() {
        const params = {
            imei: ctx.imei,
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError("Failed to encrypt params");
        const response2 = await utils.request(utils.makeURL(services2URL, { params: encryptedParams }), {
            method: "GET",
        });
        return utils.resolve(response2);
    };
});
