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

exports.ChatTTL = void 0;
(function (ChatTTL) {
    ChatTTL[ChatTTL["NO_DELETE"] = 0] = "NO_DELETE";
    ChatTTL[ChatTTL["ONE_DAY"] = 86400000] = "ONE_DAY";
    ChatTTL[ChatTTL["SEVEN_DAYS"] = 604800000] = "SEVEN_DAYS";
    ChatTTL[ChatTTL["FOURTEEN_DAYS"] = 1209600000] = "FOURTEEN_DAYS";
})(exports.ChatTTL || (exports.ChatTTL = {}));
const updateAutoDeleteChatFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/conv/autodelete/updateConvers`);
    /**
     * Auto delete chat
     *
     * @param ttl The time to live of the chat
     * @param threadId The thread ID to auto delete chat
     * @param type Type of thread (User or Group)
     *
     * @throws {ZaloApiError}
     */
    return async function updateAutoDeleteChat(ttl, threadId, type = Enum.ThreadType.User) {
        const params = {
            threadId: threadId,
            isGroup: type === Enum.ThreadType.Group ? 1 : 0,
            ttl: ttl,
            clientLang: ctx.language,
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
