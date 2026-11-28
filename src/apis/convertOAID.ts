import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type ConvertOAIDResponse = {
    [oaId: string]: string;
};

export const convertOAIDFactory = apiFactory<ConvertOAIDResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/oa/convertid`);

    /**
     * Convert OA ID(s)
     *
     * @param oaId The OA ID(s) to convert
     * 
     * @throws {ZaloApiError}
     */
    return async function convertOAID(oaId: string | string[]) {
        if (!Array.isArray(oaId)) oaId = [oaId];

        const params = {
            oa_ids: oaId,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
