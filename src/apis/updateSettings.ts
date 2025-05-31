import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type UpdateSettingsResponse = {};

export type UpdateSettingsType =
    | "view_birthday"
    | "online_status"
    | "seen_status"
    | "receive_message"
    | "accept_call"
    | "phone_search"
    | "find_me_via_qr"
    | "common_group"
    | "find_me_via_contact"
    | "recommend_friend"
    | "archive_chat"
    | "quick_msg";

export const updateSettingsFactory = apiFactory<UpdateSettingsResponse>()((_api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`https://wpa.chat.zalo.me/api/setting/update`);

    /**
     * Set account settings - implement managing various account settings
     *
     * @param type The type of setting to update
     * @param status
     *
     * @throws ZaloApiError
     */
    return async function updateSettings(type: UpdateSettingsType, status: number) {
        const params = {
            ...(type === "view_birthday" && { view_birthday: status }), // 1 is show full day/month/year | 2 is show day/month | 0 is hide
            ...(type === "online_status" && { show_online_status: status }), // 1 is online | 0 is offline
            ...(type === "seen_status" && { display_seen_status: status }), // 1 is show | 0 is hide
            ...(type === "receive_message" && { receive_message: status }), // 1 is allow everyone to message | 2 is only friend
            ...(type === "accept_call" && { accept_stranger_call: status }), // 2 is only friends | 3 is allow everyone to message | 4 is friends and person who contacted
            ...(type === "phone_search" && { add_friend_via_phone: status }), // 1 is enable | 0 is disable
            ...(type === "find_me_via_qr" && { add_friend_via_qr: status }), // 1 is enable | 0 is disable
            ...(type === "common_group" && { add_friend_via_group: status }), // 1 is show common group | 0 is unshow common group
            ...(type === "find_me_via_contact" && { add_friend_via_contact: status }), // 1 is enable | 0 is disable
            ...(type === "recommend_friend" && { display_on_recommend_friend: status }), // 1 is recommend | 0 is not recommend
            ...(type === "archive_chat" && { archivedChatStatus: status }), // 1 is enable | 0 is disable
            ...(type === "quick_msg" && { quickMessageStatus: status }), // 1 is enable | 0 is disable
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
