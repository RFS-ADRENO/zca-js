'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

exports.UpdateSettingsType = void 0;
(function (UpdateSettingsType) {
    UpdateSettingsType["ViewBirthday"] = "view_birthday";
    UpdateSettingsType["ShowOnlineStatus"] = "show_online_status";
    UpdateSettingsType["DisplaySeenStatus"] = "display_seen_status";
    UpdateSettingsType["ReceiveMessage"] = "receive_message";
    UpdateSettingsType["AcceptCall"] = "accept_stranger_call";
    UpdateSettingsType["AddFriendViaPhone"] = "add_friend_via_phone";
    UpdateSettingsType["AddFriendViaQR"] = "add_friend_via_qr";
    UpdateSettingsType["AddFriendViaGroup"] = "add_friend_via_group";
    UpdateSettingsType["AddFriendViaContact"] = "add_friend_via_contact";
    UpdateSettingsType["DisplayOnRecommendFriend"] = "display_on_recommend_friend";
    UpdateSettingsType["ArchivedChat"] = "archivedChatStatus";
    UpdateSettingsType["QuickMessage"] = "quickMessageStatus";
})(exports.UpdateSettingsType || (exports.UpdateSettingsType = {}));
const updateSettingsFactory = utils.apiFactory()((_api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`https://wpa.chat.zalo.me/api/setting/update`);
    /**
     * Set account settings
     *
     * @param type The type of setting to update
     * @param value
     *
     * ViewBirthday
     * * 0: hide
     * * 1: show full day/month/year
     * * 2: show day/month
     *
     * ShowOnlineStatus
     * * 0: hide
     * * 1: show
     *
     * DisplaySeenStatus
     * * 0: hide
     * * 1: show
     *
     * ReceiveMessage
     * * 1: everyone
     * * 2: only friends
     *
     * AcceptCall
     * * 2: only friends
     * * 3: everyone
     * * 4: friends and person who contacted
     *
     * AddFriendViaPhone
     * * 0: disable
     * * 1: enable
     *
     * AddFriendViaQR
     * * 0: disable
     * * 1: enable
     *
     * AddFriendViaGroup
     * * 0: disable
     * * 1: enable
     *
     * AddFriendViaContact
     * * 0: disable
     * * 1: enable
     *
     * DisplayOnRecommendFriend
     * * 0: disable
     * * 1: enable
     *
     * ArchivedChat
     * * 0: disable
     * * 1: enable
     *
     * QuickMessage
     * * 0: disable
     * * 1: enable
     *
     * @throws {ZaloApiError}
     */
    return async function updateSettings(type, value) {
        const params = {
            [type]: value,
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt params");
        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });
        return utils.resolve(response);
    };
});

exports.updateSettingsFactory = updateSettingsFactory;
