import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type UnShowOnlineStatusResponse = {};

export const unshowOnlineStatusFactory = apiFactory<UnShowOnlineStatusResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`https://wpa.chat.zalo.me/api/setting/update`);

    /**
     * Unshow online status
     *
     * @throws ZaloApiError
     */
    return async function unshowOnlineStatus() {
        const params = {
            show_online_status: 0,
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
