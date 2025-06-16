'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var Enum = require('../models/Enum.cjs');
require('../models/FriendEvent.cjs');
require('../models/GroupEvent.cjs');
require('../models/Reaction.cjs');
var utils = require('../utils.cjs');

const undoFactory = utils.apiFactory()((api, ctx, utils) => {
    const URLType = {
        [Enum.ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.chat[0]}/api/message/undo`),
        [Enum.ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/undomsg`),
    };
    /**
     * Undo a message
     *
     * @param options Undo options
     * @param threadId group or user id
     * @param type Message type (User or GroupMessage)
     *
     * @throws ZaloApiError
     */
    return async function undo(options, threadId, type) {
        const params = {
            msgId: options.msgId,
            clientId: Date.now(),
            cliMsgIdUndo: options.cliMsgId,
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
