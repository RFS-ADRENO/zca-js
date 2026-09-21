'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const updateHiddenConversPinFactory = utils.apiFactory()((api, ctx, utils$1) => {
    const serviceURL = utils$1.makeURL(`${api.zpwServiceMap.conversation[0]}/api/hiddenconvers/update-pin`);
    const pinRegex = /^\d{4}$/;
    /**
     * Update hidden conversation pin
     *
     * @param pin The pin to update (must be a 4-digit number between 0000-9999)
     *
     * @throws {ZaloApiError}
     */
    return async function updateHiddenConversPin(pin) {
        if (!pinRegex.test(pin)) {
            throw new ZaloApiError.ZaloApiError("Pin must be a 4-digit number between 0000-9999");
        }
        const encryptedPin = utils.encryptPin(pin);
        const params = {
            new_pin: encryptedPin,
            imei: ctx.imei,
        };
        const encryptedParams = utils$1.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt params");
        const response = await utils$1.request(utils$1.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });
        return utils$1.resolve(response);
    };
});

exports.updateHiddenConversPinFactory = updateHiddenConversPinFactory;
