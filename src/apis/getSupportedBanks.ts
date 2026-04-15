import { ZaloApiError } from "../Errors/ZaloApiError.js";
import type { BankInfo } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type GetSupportedBanksResponse = {
    banks: BankInfo[];
};

export const getSupportedBanksFactory = apiFactory<GetSupportedBanksResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.zimsg[0]}/api/transfer/conf`);

    /**
     * Get supported banks
     *
     * @throws {ZaloApiError}
     */
    return async function getSupportedBanks() {
        const params = {};

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
