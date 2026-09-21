'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');
require('../models/AutoReply.cjs');
require('../models/Bank.cjs');
require('../models/Board.cjs');
require('../models/Enum.cjs');
require('../models/FriendEvent.cjs');
require('../models/Group.cjs');
require('../models/GroupEvent.cjs');
var Message = require('../models/Message.cjs');
require('../models/Reaction.cjs');
require('../models/Reminder.cjs');
require('../models/ZBusiness.cjs');

const getGroupChatHistoryFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/history`);
    /**
     * Get group chat history
     *
     * @param groupId group id
     * @param count count of messages to return (default: 50)
     *
     * @throws {ZaloApiError}
     */
    return async function getGroupChatHistory(groupId, count = 50) {
        const params = {
            grid: groupId,
            count: count,
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt params");
        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });
        return utils.resolve(response, (result) => {
            let data = result.data;
            if (typeof data === "string") {
                data = JSON.parse(data);
            }
            for (let i = 0; i < data.groupMsgs.length; i++) {
                data.groupMsgs[i] = new Message.GroupMessage(ctx.uid, data.groupMsgs[i]);
            }
            return data;
        });
    };
});

exports.getGroupChatHistoryFactory = getGroupChatHistoryFactory;
