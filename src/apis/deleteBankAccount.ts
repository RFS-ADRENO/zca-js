import { ZaloApiError } from "../Errors/ZaloApiError.js";
import type { BankAccount } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type DeleteBankAccountPayload = {
    accountId: number;
    isDefault: boolean;
};

export type DeleteBankAccountResponse = {
    hasMore: boolean;
    total: number;
    myBanks: BankAccount[];
};

export const deleteBankAccountFactory = apiFactory<DeleteBankAccountResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.zimsg[0]}/api/transfer/delete`);

    /**
     * Delete bank account
     *
     * @param payload The payload containing the bank account information to delete
     *
     * @throws {ZaloApiError} When something went wrong, with `error.code`
     * - `114` - Invalid params
     * - `-265` - Bank account not exists
     * - `810` Internal Zalo error, maybe you're trying to delete a default bank account
     */
    return async function deleteBankAccount(payload: DeleteBankAccountPayload) {
        const params = {
            account_id: payload.accountId,
            is_default: payload.isDefault,
            language: ctx.language,
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
