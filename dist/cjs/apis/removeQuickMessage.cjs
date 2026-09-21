'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const removeQuickMessageFactory = utils.apiFactory()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.quick_message[0]}/api/quickmessage/delete`);
    /**
     * Remove quick message
     *
     * @param itemIds - The id(s) of the quick message(s) to remove (number or number[])
     *
     * @note Zalo might throw an error with code 212 if the item does not exist
     *
     * @throws {ZaloApiError}
     */
    return async function removeQuickMessage(itemIds) {
        const idsArray = Array.isArray(itemIds) ? itemIds : [itemIds];
        const params = {
            itemIds: idsArray,
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt params");
        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });
        return utils.resolve(response);
    };
});

exports.removeQuickMessageFactory = removeQuickMessageFactory;
