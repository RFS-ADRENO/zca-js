import { ZaloApiError } from "../Errors/ZaloApiError.js";
import type { BankAccount, BinBankCard } from "../models/index.js";
import { apiFactory, normalizeHolderName } from "../utils.js";

export type UpdateBankAccountPayload = {
    accountId: number;
    binBank: BinBankCard;
    numAccBank: string;
    nameAccBank: string;
};

export type UpdateBankAccountResponse = BankAccount;

export const updateBankAccountFactory = apiFactory<UpdateBankAccountResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.zimsg[0]}/api/transfer/update`);

    /**
     * Update bank account
     *
     * @param payload The payload containing the bank account information to update
     *
     * @throws {ZaloApiError}
     */
    return async function updateBankAccount(payload: UpdateBankAccountPayload) {
        const params = {
            account_id: payload.accountId,
            bin: payload.binBank,
            bank_number: payload.numAccBank,
            holder_name: normalizeHolderName(payload.nameAccBank),
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
