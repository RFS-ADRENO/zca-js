'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var Enum = require('../models/Enum.cjs');
require('../models/FriendEvent.cjs');
require('../models/GroupEvent.cjs');
require('../models/Reaction.cjs');
var utils = require('../utils.cjs');

const addUnreadMarkFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/conv/addUnreadMark`);
    /**
     * Add unread mark to conversation
     *
     * @param threadId Thread ID
     * @param type Thread type (User/Group)
     *
     * @throws ZaloApiError
     */
    return async function addUnreadMark(threadId, type = Enum.ThreadType.User) {
        const timestamp = Date.now();
        const timestampString = Date.now().toString();
        const requestParams = {
            param: JSON.stringify({
                convsGroup: type === Enum.ThreadType.Group
                    ? [
                        {
                            id: threadId,
                            cliMsgId: timestampString,
                            fromUid: "0",
                            ts: timestamp,
                        },
                    ]
                    : [],
                convsUser: type === Enum.ThreadType.User
                    ? [
                        {
                            id: threadId,
                            cliMsgId: timestampString,
                            fromUid: "0",
                            ts: timestamp,
                        },
                    ]
                    : [],
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
        return utils.resolve(response);
    };
});

exports.addUnreadMarkFactory = addUnreadMarkFactory;
