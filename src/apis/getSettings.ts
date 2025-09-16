import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetSettingsResponse = {
    add_friend_via_contact: number;
    display_on_recommend_friend: number;
    add_friend_via_group: number;
    add_friend_via_qr: number;
    quick_message_status: number;
    show_online_status: boolean;
    accept_stranger_call: number;
    archived_chat_status: number;
    receive_message: number;
    add_friend_via_phone: number;
    display_seen_status: number;
    view_birthday: number;
    setting_2FA_status: number;
};

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
