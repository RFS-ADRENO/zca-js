'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');
require('../models/AutoReply.cjs');
require('../models/Bank.cjs');
require('../models/Board.cjs');
var Enum = require('../models/Enum.cjs');
require('../models/FriendEvent.cjs');
require('../models/Group.cjs');
require('../models/GroupEvent.cjs');
require('../models/Reaction.cjs');
require('../models/Reminder.cjs');
require('../models/ZBusiness.cjs');

const getUserInfoFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/friend/getprofiles/v2`);
    /**
     * Get user info using user id
     *
     * @param userId User id(s)
     * @param avatarSize Avatar size (default: AvatarSize.Small)
     *
     * @throws {ZaloApiError}
     */
    return async function getUserInfo(userId, avatarSize = Enum.AvatarSize.Small) {
        if (!userId)
            throw new ZaloApiError.ZaloApiError("Missing user id");
        if (!Array.isArray(userId))
            userId = [userId];
        userId = userId.map((id) => {
            if (id.split("_").length > 1) {
                return id;
            }
            return `${id}_0`;
        });
        const params = {
            phonebook_version: ctx.extraVer.phonebook,
            friend_pversion_map: userId,
            avatar_size: avatarSize,
            language: ctx.language,
            show_online_status: 1,
            imei: ctx.imei,
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt params");
        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils.resolve(response);
    };
});

exports.getUserInfoFactory = getUserInfoFactory;
