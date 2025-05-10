'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var Enum = require('../models/Enum.cjs');
require('../models/FriendEvent.cjs');
require('../models/GroupEvent.cjs');
require('../models/Reaction.cjs');
var utils = require('../utils.cjs');

const pinConversationsFactory = utils.apiFactory()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/pinconvers/updatev2`);
    /**
     * Pin and unpin conversations of the thread (USER or GROUP)
     *
     * @param pin Should pin conversations
     * @param threadId The ID(s) of the thread (USER or GROUP)
     * @param type Type of thread, default user
     *
     * @throws ZaloApiError
     *
     */
    return async function pinConversations(pin, threadId, type = Enum.ThreadType.User) {
        if (typeof threadId == "string")
            threadId = [threadId];
        const params = {
            actionType: pin ? 1 : 2,
            conversations: type == Enum.ThreadType.Group ? threadId.map((id) => `g${id}`) : threadId.map((id) => `u${id}`),
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

exports.pinConversationsFactory = pinConversationsFactory;
