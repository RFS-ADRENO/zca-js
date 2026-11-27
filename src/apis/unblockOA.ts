import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type UnBlockOAResponse = "";

export const unblockOAFactory = apiFactory<UnBlockOAResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/oa/unblock`);

    /**
     * Unblock a OA (Official Account)
     *
     * @param OAId The ID of the OA (Official Account) to unblock
     *
     * @throws {ZaloApiError}
     */
    return async function unblockOA(OAId: string) {
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
