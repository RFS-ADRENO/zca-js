'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var Enum = require('../models/Enum.cjs');
require('../models/FriendEvent.cjs');
require('../models/GroupEvent.cjs');
require('../models/Reaction.cjs');
var utils = require('../utils.cjs');

const removeHiddenConversPinFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/hiddenconvers/add-remove`);
    /**
     * Remove hidden conversation pin
     *
     * @param threadId Thread ID
     * @param type Thread type (User/Group)
     *
     * @throws ZaloApiError
     */
    return async function removeHiddenConversPin(threadId, type = Enum.ThreadType.User) {
        const params = {
            del_threads: JSON.stringify([
                {
                    thread_id: threadId,
                    is_group: type === Enum.ThreadType.Group ? 1 : 0,
                },
            ]),
            add_threads: "[]",
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

exports.removeHiddenConversPinFactory = removeHiddenConversPinFactory;
