import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory, encryptPin } from "../utils.js";

export type UpdateHiddenConversPinResponse = "";

export const updateHiddenConversPinFactory = apiFactory<UpdateHiddenConversPinResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/hiddenconvers/update-pin`);

    /**
     * Update hidden conversation pin
     *
     * @param pin The pin to update (must be a 4-digit number between 0000-9999)
     *
     * @throws ZaloApiError
     */
    return async function updateHiddenConversPin(pin: number) {
        const pinStr = pin.toString().padStart(4, '0');
        if (!Number.isInteger(pin) || pinStr.length !== 4) {
            throw new ZaloApiError("Pin must be a 4-digit number between 0000-9999");
        }

        const encryptedPin = encryptPin(pin);
        const params = {
            new_pin: encryptedPin,
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
