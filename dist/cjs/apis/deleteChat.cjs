'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
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
var utils = require('../utils.cjs');

const deleteChatFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = {
        [Enum.ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.chat[0]}/api/message/deleteconver`, {
            nretry: 0,
        }),
        [Enum.ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/deleteconver`, {
            nretry: 0,
        }),
    };
    /**
     * Delete chat
     *
     * @param lastMessage Last message info
     * @param threadId Thread ID
     * @param type Thread type
     *
     * @throws {ZaloApiError}
     */
    return async function deleteChat(lastMessage, threadId, type = Enum.ThreadType.User) {
        const timestampString = Date.now().toString();
        const params = type === Enum.ThreadType.User
            ? {
                toid: threadId,
                cliMsgId: timestampString,
                conver: lastMessage,
                onlyMe: 1,
                imei: ctx.imei,
            }
            : {
                grid: threadId,
                cliMsgId: timestampString,
                conver: lastMessage,
                onlyMe: 1,
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

exports.deleteChatFactory = deleteChatFactory;
