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

const getMultiUsersByPhonesFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/profile/multiget`);
    /**
     * Get multiple user(s) by their phone numbers.
     *
     * @param phoneNumbers Phone number(s)
     * @param avatarSize Avatar size (default: AvatarSize.Large)
     *
     * @throws {ZaloApiError}
     */
    return async function getMultiUsersByPhones(phoneNumbers, avatarSize = Enum.AvatarSize.Large) {
        if (!phoneNumbers)
            throw new ZaloApiError.ZaloApiError("Missing phoneNumbers");
        if (!Array.isArray(phoneNumbers))
            phoneNumbers = [phoneNumbers];
        phoneNumbers = phoneNumbers.map((phone) => {
            if (phone.startsWith("0")) {
                if (ctx.language == "vi")
                    phone = "84" + phone.slice(1);
            }
            return phone;
        });
        const params = {
            phones: phoneNumbers,
            avatar_size: avatarSize,
            language: ctx.language,
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

exports.getMultiUsersByPhonesFactory = getMultiUsersByPhonesFactory;
