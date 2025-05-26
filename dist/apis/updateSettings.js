import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";
export const updateSettingsFactory = apiFactory()((_api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`https://wpa.chat.zalo.me/api/setting/update`);
    /**
     * Set account settings - implement managing various account settings
     *
     * @param type The type of setting to update
     * @param status
     *
     * @throws ZaloApiError
     */
    return async function updateSettings(type, status) {
        const params = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (type === "view_birthday" && { view_birthday: status })), (type === "online_status" && { show_online_status: status })), (type === "seen_status" && { display_seen_status: status })), (type === "receive_message" && { receive_message: status })), (type === "accept_call" && { accept_stranger_call: status })), (type === "phone_search" && { add_friend_via_phone: status })), (type === "find_me_via_qr" && { add_friend_via_qr: status })), (type === "common_group" && { add_friend_via_group: status })), (type === "find_me_via_contact" && { add_friend_via_contact: status })), (type === "recommend_friend" && { display_on_recommend_friend: status }));
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError("Failed to encrypt params");
        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });
        return utils.resolve(response);
    };
});
