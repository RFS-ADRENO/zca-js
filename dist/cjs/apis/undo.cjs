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

const undoFactory = utils.apiFactory()((api, ctx, utils) => {
    const URLType = {
        [Enum.ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.chat[0]}/api/message/undo`),
        [Enum.ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/undomsg`),
    };
    /**
     * Undo a message
     *
     * @param payload Undo payload containing message ID and client message ID
     * @param threadId group or user id
     * @param type Message type (User or Group), default is User
     *
     * @throws {ZaloApiError}
     */
    return async function undo(payload, threadId, type = Enum.ThreadType.User) {
        const params = {
            msgId: payload.msgId,
            clientId: Date.now(),
            cliMsgIdUndo: payload.cliMsgId,
        };
        if (type == Enum.ThreadType.Group) {
            params["grid"] = threadId;
            params["visibility"] = 0;
            params["imei"] = ctx.imei;
        }
        else
            params["toid"] = threadId;
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt message");
        const response = await utils.request(URLType[type], {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils.resolve(response);
    };
});

exports.undoFactory = undoFactory;
