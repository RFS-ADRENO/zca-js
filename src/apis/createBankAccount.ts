import { ZaloApiError } from "../Errors/ZaloApiError.js";
import type { BankAccount, BinBankCard } from "../models/index.js";
import { apiFactory, normalizeHolderName } from "../utils.js";

export type CreateBankAccountPayload = {
    binBank: BinBankCard;
    numAccBank: string;
    nameAccBank: string;
};

export type CreateBankAccountResponse = BankAccount;

export const createBankAccountFactory = apiFactory<CreateBankAccountResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.zimsg[0]}/api/transfer/create`);

    /**
     * Create bank account
     *
     * @param payload The payload containing the bank account information
     *
     * @throws {ZaloApiError}
     */
    return async function createBankAccount(payload: CreateBankAccountPayload) {
        const params = {
            bin: payload.binBank,
            bank_number: payload.numAccBank,
            holder_name: normalizeHolderName(payload.nameAccBank),
            language: ctx.language,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
