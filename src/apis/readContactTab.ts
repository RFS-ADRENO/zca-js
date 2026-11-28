import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type ReadContactTabResponse = "";

export const readContactTabFactory = apiFactory<ReadContactTabResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/read-contact-tab`);

    /**
     * Read contact tab
     *
     * @throws {ZaloApiError}
     *
     */
    return async function readContactTab() {
        const params = {
            ts: Date.now(),
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
