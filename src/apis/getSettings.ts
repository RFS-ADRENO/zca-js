import { ZaloApiError } from "../Errors/ZaloApiError.js";
import type { UserSetting } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type GetSettingsResponse = UserSetting;

export const getSettingsFactory = apiFactory<GetSettingsResponse>()((_api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`https://wpa.chat.zalo.me/api/setting/me`);

    /**
     * Get my account settings
     *
     * @throws {ZaloApiError}
     */
    return async function getSettings() {
        const params = {};

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
