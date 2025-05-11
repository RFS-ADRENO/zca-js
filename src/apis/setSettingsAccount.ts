import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type SetSettingsAccountResponse = {};

export type SettingType = "phone_search" | "online_status";

export const setSettingsAccountFactory = apiFactory<SetSettingsAccountResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`https://wpa.chat.zalo.me/api/setting/update`);

    /**
     * Set account settings - implement managing various account settings
     *
     * @param type The type of setting to update ('phone_search' or 'online_status')
     * @param status 1 is enabled/online, 0 is disabled/offline
     *
     * @throws ZaloApiError
     */
    return async function setSettingsAccount(type: SettingType, status: number) {
        const params = {
            ...(type === "phone_search" && { add_friend_via_phone: status }),
            ...(type === "online_status" && { show_online_status: status }),
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
