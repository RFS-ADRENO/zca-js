'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const deleteAutoReplyFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.auto_reply[0]}/api/autoreply/delete`);
    /**
     * Delete auto reply
     *
     * @param id id of auto reply
     *
     * @note this API used for zBusiness
     * @throws {ZaloApiError}
     */
    return async function deleteAutoReply(id) {
        const params = {
            cliLang: ctx.language,
            id: id,
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt params");
        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils.resolve(response);
    };
});

exports.deleteAutoReplyFactory = deleteAutoReplyFactory;
