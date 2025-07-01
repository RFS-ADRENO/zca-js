'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var Enum = require('../models/Enum.cjs');
require('../models/FriendEvent.cjs');
require('../models/GroupEvent.cjs');
require('../models/Reaction.cjs');
var utils = require('../utils.cjs');

const removeUnreadMarkFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/conv/removeUnreadMark`);
    /**
     * Remove unread mark from conversation
     *
     * @param threadId Thread ID
     * @param type Thread type (User/Group)
     *
     * @throws ZaloApiError
     */
    return async function removeUnreadMark(threadId, type = Enum.ThreadType.User) {
        const timestamp = Date.now();
        const requestParams = {
            param: JSON.stringify({
                convsGroup: type === Enum.ThreadType.Group ? [threadId] : [],
                convsUser: type === Enum.ThreadType.User ? [threadId] : [],
                convsGroupData: type === Enum.ThreadType.Group
                    ? [
                        {
                            id: threadId,
                            ts: timestamp,
                        },
                    ]
                    : [],
                convsUserData: type === Enum.ThreadType.User
                    ? [
                        {
                            id: threadId,
                            ts: timestamp,
                        },
                    ]
                    : [],
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

exports.removeUnreadMarkFactory = removeUnreadMarkFactory;
