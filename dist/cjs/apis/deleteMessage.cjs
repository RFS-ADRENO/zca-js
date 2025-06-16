'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var Enum = require('../models/Enum.cjs');
require('../models/FriendEvent.cjs');
require('../models/GroupEvent.cjs');
require('../models/Reaction.cjs');
var utils = require('../utils.cjs');

const deleteMessageFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = {
        [Enum.ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.chat[0]}/api/message/delete`),
        [Enum.ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/deletemsg`),
    };
    /**
     * Delete a message
     *
     * @param options Delete target data
     * @param onlyMe Delete message for only you
     *
     * @throws ZaloApiError
     */
    return async function deleteMessage(options, threadId, type = Enum.ThreadType.User) {
        const isGroup = type === Enum.ThreadType.Group;
        const isSelf = ctx.uid == options.uidFrom;
        if (isSelf && options.onlyMe === false)
            throw new ZaloApiError.ZaloApiError("To delete your message for everyone, use undo api instead");
        const params = {
            [isGroup ? "grid" : "toid"]: threadId,
            cliMsgId: Date.now(),
            msgs: [
                {
                    cliMsgId: options.cliMsgId,
                    globalMsgId: options.msgId,
                    ownerId: options.uidFrom,
                    destId: threadId,
                },
            ],
            onlyMe: options.onlyMe ? 1 : 0,
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
