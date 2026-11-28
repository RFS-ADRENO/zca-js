import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetLastReadContactTabResponse = {
    ts: number;
};

export const getLastReadContactTabFactory = apiFactory<GetLastReadContactTabResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/last-read-contact-tab`);

    /**
     * Get the contact tab for the last read from the contacts
     *
     * @throws {ZaloApiError}
     *
     */
    return async function getLastReadContactTab() {
        const params = {};

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
