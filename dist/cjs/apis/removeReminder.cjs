'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var Enum = require('../models/Enum.cjs');
require('../models/FriendEvent.cjs');
require('../models/GroupEvent.cjs');
require('../models/Reaction.cjs');
var utils = require('../utils.cjs');

const removeReminderFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = {
        [Enum.ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/oneone/remove`),
        [Enum.ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/topic/remove`),
    };
    /**
     * Remove a reminder in a (user/group)
     *
     * @param topicId (Reminder/Topic) ID to remove reminder from
     * @param threadId (User/Group) ID to remove reminder from
     * @param type Thread type (User or Group)
     *
     * @throws ZaloApiError
     */
    return async function removeReminder(topicId, threadId, type = Enum.ThreadType.User) {
        const params = type === Enum.ThreadType.User
            ? {
                uid: threadId,
                reminderId: topicId,
            }
            : {
                grid: threadId,
                topicId: topicId,
                imei: ctx.imei,
            };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt params");
        const response = await utils.request(serviceURL[type], {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils.resolve(response);
    };
});

exports.removeReminderFactory = removeReminderFactory;
