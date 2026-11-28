import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type BlockOAResponse = "";

export const blockOAFactory = apiFactory<BlockOAResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/oa/block`);

    /**
     * Block a OA (Official Account)
     *
     * @param OAId The ID of the OA (Official Account) to block
     *
     * @throws {ZaloApiError}
     */
    return async function blockOA(OAId: string) {
        const params = {
            oaid: OAId,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
