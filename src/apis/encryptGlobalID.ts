import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type EncryptGlobalIDResponse = {
    [userID: string]: string;
};

export const encryptGlobalIDFactory = apiFactory<EncryptGlobalIDResponse>()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/gid/encrypt`);

    /**
     * Encrypt global ID
     * 
     * @param globalID User ID or list of user IDs
     *
     * @throws {ZaloApiError}
     */
    return async function encryptGlobalID(globalID: string | string[]) {
        if (!globalID) throw new ZaloApiError("Missing global id");

        if (!Array.isArray(globalID)) globalID = [globalID];

        const params = {
            noiseUids: JSON.stringify(globalID),
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
