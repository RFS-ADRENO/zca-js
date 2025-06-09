'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var Enum = require('../models/Enum.cjs');
require('../models/FriendEvent.cjs');
require('../models/GroupEvent.cjs');
require('../models/Reaction.cjs');
var utils = require('../utils.cjs');

const updateAutoDeleteChatFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/conv/autodelete/updateConvers`);
    /**
     * Update auto delete chat
     *
     * @param ttl - The time to live for the autoDeleteMessage of API
     * @param threadId - The ID of the thread to update
     * @param isGroup - Whether the thread is a group
     *
     * @throws ZaloApiError
     */
    return async function updateAutoDeleteChat(ttl = 0, threadId, isGroup = Enum.ThreadType.Group) {
        const params = {
            "threadId": threadId,
            "isGroup": isGroup === Enum.ThreadType.Group ? 1 : 0,
            "ttl": ttl, // time update autoDeleteMessage
            "clientLang": ctx.language
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

exports.updateAutoDeleteChatFactory = updateAutoDeleteChatFactory;
