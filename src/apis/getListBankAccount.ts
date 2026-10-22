import { ZaloApiError } from "../Errors/ZaloApiError.js";
import type { BankAccount } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type GetListBankAccountResponse = {
    hasMore: boolean;
    total: number;
    myBanks: BankAccount[];
};

export const getListBankAccountFactory = apiFactory<GetListBankAccountResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.zimsg[0]}/api/transfer/list`);

    /**
     * Get list bank accounts
     *
     * @param page Page number (default: 0)
     * @param limit Number of items to retrieve (default: 20)
     *
     * @throws {ZaloApiError} When something went wrong, with `error.code`
     * - `114` - Invalid params
     */
    return async function getListBankAccount(page: number = 0, limit: number = 20) {
        const params = {
            page: page,
            limit: limit,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
