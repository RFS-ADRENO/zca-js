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

const setHiddenConversationsFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/hiddenconvers/add-remove`);
    /**
     * Set hidden conversations
     *
     * @param hidden - Hide or unhide conversations
     * @param threadId Thread ID(s)
     * @param type Thread type (User/Group)
     *
     * @throws {ZaloApiError}
     */
    return async function setHiddenConversations(hidden, threadId, type = Enum.ThreadType.User) {
        threadId = Array.isArray(threadId) ? threadId : [threadId];
        if (threadId.length === 0)
            throw new ZaloApiError.ZaloApiError("threadId is required");
        const is_group = type === Enum.ThreadType.Group ? 1 : 0;
        const params = {
            [hidden ? "add_threads" : "del_threads"]: JSON.stringify(threadId.map((id) => ({
                thread_id: id,
                is_group: is_group,
            }))),
            [hidden ? "del_threads" : "add_threads"]: "[]",
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

exports.setHiddenConversationsFactory = setHiddenConversationsFactory;
