import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory, encryptPin } from "../utils.js";

export type ResetHiddenConversPinResponse = "";

export const resetHiddenConversPinFactory = apiFactory<ResetHiddenConversPinResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/hiddenconvers/reset`);

    /**
     * Reset hidden conversation pin
     *
     * @throws ZaloApiError
     */
    return async function resetHiddenConversPin() {
        const params = {};

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
