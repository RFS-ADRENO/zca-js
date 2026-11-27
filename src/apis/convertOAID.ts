import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type ConvertOAIDResponse = Record<string, unknown>; // @TODO: check type

export const convertOAIDFactory = apiFactory<ConvertOAIDResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/oa/convertid`);

    /**
     * Convert OA ID(s)
     *
     * @throws {ZaloApiError}
     */
    return async function convertOAID(OAId: string | string[]) {
        if (!Array.isArray(OAId)) OAId = [OAId];

        const params = {
            oa_ids: OAId,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
