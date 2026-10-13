import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type DecryptGlobalIDResponse = {
    [globalID: string]: string;
};

export const decryptGlobalIDFactory = apiFactory<DecryptGlobalIDResponse>()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/gid/decrypt`);

    /**
     * Decrypt global ID
     * 
     * @param globalID Global ID or list of global IDs
     *
     * @throws {ZaloApiError}
     */
    return async function decryptGlobalID(globalID: string | string[]) {
        if (!globalID) throw new ZaloApiError("Missing global id");

        if (!Array.isArray(globalID)) globalID = [globalID];

        const params = {
            globalUids: JSON.stringify(globalID),
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
