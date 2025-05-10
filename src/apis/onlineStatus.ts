import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type OnlineStatusResponse = {};

export const onlineStatusFactory = apiFactory<OnlineStatusResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`https://wpa.chat.zalo.me/api/setting/update`);

    /**
     * Online status
     *
     * @param status 1 is online, 0 is offline
     * 
     * @throws ZaloApiError
     */
    return async function onlineStatus(status: number) {
        const params = {
            show_online_status: status,
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
