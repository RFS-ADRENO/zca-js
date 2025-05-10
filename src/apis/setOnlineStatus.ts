import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type SetOnlineStatusResponse = {};

export const setOnlineStatusFactory = apiFactory<SetOnlineStatusResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`https://wpa.chat.zalo.me/api/setting/update`);

    /**
     * Set online status - implement managing online status visibility
     *
     * @param status 1 is online, 0 is offline
     * 
     * @throws ZaloApiError
     */
    return async function setOnlineStatus(status: number) {
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
