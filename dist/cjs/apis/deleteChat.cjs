'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var Enum = require('../models/Enum.cjs');
require('../models/FriendEvent.cjs');
require('../models/GroupEvent.cjs');
require('../models/Reaction.cjs');
var utils = require('../utils.cjs');

const deleteChatFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = {
        [Enum.ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.chat[0]}/api/message/deleteconver`, {
            nretry: 0,
        }),
        [Enum.ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/deleteconver`, {
            nretry: 0,
        }),
    };
    /**
     * Delete chat
     *
     * @param converInfo Conversation info containing ownerId and globalMsgId
     * @param threadId Thread ID (toid for User, grid for Group)
     * @param type Thread type
     *
     * @throws ZaloApiError
     */
    return async function deleteChat(converInfo, threadId, type = Enum.ThreadType.User) {
        const timestampString = Date.now().toString();
        const params = type === Enum.ThreadType.User
            ? {
                toid: threadId,
                cliMsgId: timestampString,
                conver: Object.assign(Object.assign({}, converInfo), { cliMsgId: timestampString }),
                onlyMe: 1,
                imei: ctx.imei,
            }
            : {
                grid: threadId,
                cliMsgId: timestampString,
                conver: Object.assign(Object.assign({}, converInfo), { cliMsgId: timestampString }),
                onlyMe: 1,
                imei: ctx.imei,
            };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt params");
        const response = await utils.request(serviceURL[type], {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils.resolve(response);
    };
});

exports.deleteChatFactory = deleteChatFactory;
