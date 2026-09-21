'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const updateBankAccountFactory = utils.apiFactory()((api, ctx, utils$1) => {
    const serviceURL = utils$1.makeURL(`${api.zpwServiceMap.zimsg[0]}/api/transfer/update`);
    /**
     * Update bank account
     *
     * @param payload The payload containing the bank account information to update
     *
     * @throws {ZaloApiError}
     */
    return async function updateBankAccount(payload) {
        const params = {
            account_id: payload.accountId,
            bin: payload.binBank,
            bank_number: payload.numAccBank,
            holder_name: utils.normalizeHolderName(payload.nameAccBank),
            language: ctx.language,
        };
        const encryptedParams = utils$1.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt params");
        const response = await utils$1.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils$1.resolve(response);
    };
});

exports.updateBankAccountFactory = updateBankAccountFactory;
