import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";
export const getFriendOnlinesFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/friend/onlines`);
    /**
     * Get friend onlines?
     *
     * @throws {ZaloApiError}
     */
    return async function getFriendOnlines() {
        const params = {
            imei: ctx.imei,
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError("Failed to encrypt params");
        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });
        return utils.resolve(response, (result) => {
            const data = result.data;
            if (Array.isArray(data.onlines)) {
                for (const online of data.onlines) {
                    if (typeof online.status === "string") {
                        const parsed = JSON.parse(online.status);
                        if (parsed && typeof parsed.status === "string") {
                            online.status = parsed.status;
                        }
                    }
                }
            }
            return data;
        });
    };
});
