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

const deleteMessageFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = {
        [Enum.ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.chat[0]}/api/message/delete`),
        [Enum.ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/deletemsg`),
    };
    /**
     * Delete a message
     *
     * @param dest Delete target
     * @param onlyMe Delete message for only you
     *
     * @throws {ZaloApiError}
     */
    return async function deleteMessage(dest, onlyMe = false) {
        const { threadId, type = Enum.ThreadType.User, data } = dest;
        const isGroup = type === Enum.ThreadType.Group;
        const isSelf = ctx.uid == data.uidFrom;
        if (isSelf && onlyMe === false)
            throw new ZaloApiError.ZaloApiError("To delete your message for everyone, use undo api instead");
        if (!isGroup && onlyMe === false)
            throw new ZaloApiError.ZaloApiError("Can't delete message for everyone in a private chat");
        const params = {
            [isGroup ? "grid" : "toid"]: threadId,
            cliMsgId: Date.now(),
            msgs: [
                {
                    cliMsgId: data.cliMsgId,
                    globalMsgId: data.msgId,
                    ownerId: data.uidFrom,
                    destId: threadId,
                },
            ],
            onlyMe: onlyMe ? 1 : 0,
        };
        if (!isGroup) {
            params.imei = ctx.imei;
        }
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt message");
        const response = await utils.request(serviceURL[type], {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils.resolve(response);
    };
});

exports.deleteMessageFactory = deleteMessageFactory;
