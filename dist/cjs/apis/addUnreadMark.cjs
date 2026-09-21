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

const addUnreadMarkFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/conv/addUnreadMark`);
    /**
     * Add unread mark to conversation
     *
     * @param threadId Thread ID
     * @param type Thread type (User/Group)
     *
     * @throws {ZaloApiError}
     */
    return async function addUnreadMark(threadId, type = Enum.ThreadType.User) {
        const timestamp = Date.now();
        const timestampString = timestamp.toString();
        const isGroup = type === Enum.ThreadType.Group;
        const requestParams = {
            param: JSON.stringify({
                [isGroup ? "convsGroup" : "convsUser"]: [
                    {
                        id: threadId,
                        cliMsgId: timestampString,
                        fromUid: "0",
                        ts: timestamp,
                    },
                ],
                [isGroup ? "convsUser" : "convsGroup"]: [],
                imei: ctx.imei,
            }),
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(requestParams));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt params");
        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils.resolve(response, (result) => {
            const data = result.data;
            if (typeof data.data === "string") {
                return {
                    data: JSON.parse(data.data),
                    status: data.status,
                };
            }
            return result.data;
        });
    };
});

exports.addUnreadMarkFactory = addUnreadMarkFactory;
