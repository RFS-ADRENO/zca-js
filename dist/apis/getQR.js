import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";
export const getQRFactory = apiFactory()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/mget-qr`);
    /**
     * Get QR code for users
     *
     * @param userId User ID or list of user IDs (string[]). If userId is a string, it will be wrapped in an array.
     *
     * @throws ZaloApiError
     */
    return async function getQR(userId) {
        if (typeof userId == "string")
            userId = [userId];
        const params = {
            fids: userId,
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
