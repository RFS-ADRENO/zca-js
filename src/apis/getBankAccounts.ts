import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetBankAccountsResponse = {
    hasMore: boolean;
    total: number;
    myBanks: {
        id: string;
        bin: number;
        default: boolean;
        bank_number: string;
        bank_logo: string;
        holder_name: string;
        created_at: number;
        updated_at: number;
        account_id: number;
        bank_name: string;
        is_default: boolean;
    }[];
};

export const getBankAccountsFactory = apiFactory<GetBankAccountsResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.zimsg[0]}/api/transfer/list`);

    /**
     * Get bank accounts
     *
     * @param page Page number (default: 0)
     * @param limit Number of items to retrieve (default: 20)
     *
     * @throws {ZaloApiError}
     */
    return async function getBankAccounts(page: number = 0, limit: number = 20) {
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
