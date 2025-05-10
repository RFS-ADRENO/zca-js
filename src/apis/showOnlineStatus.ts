import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type ShowOnlineStatusResponse = {};

export const showOnlineStatusFactory = apiFactory<ShowOnlineStatusResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`https://wpa.chat.zalo.me/api/setting/update`);

    /**
     * Show online status
     *
     * @throws ZaloApiError
     */
    return async function showOnlineStatus() {
        const params = {
            show_online_status: 1,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const urlWithParams = `${serviceURL}&params=${encodeURIComponent(encryptedParams)}`;

        const response = await utils.request(urlWithParams, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
