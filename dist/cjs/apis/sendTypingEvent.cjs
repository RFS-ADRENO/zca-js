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

const sendTypingEventFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = {
        [Enum.ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.chat[0]}/api/message/typing`),
        [Enum.ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/typing`),
    };
    /**
     * Send typing event
     *
     * @param threadId The ID of the User or Group to send the typing event to
     * @param type The type of thread (User or Group)
     * @param destType The destination type (User or Page), for User threads only, defaults to User
     *
     * @throws {ZaloApiError}
     */
    return async function sendTypingEvent(threadId, type = Enum.ThreadType.User, destType = Enum.DestType.User) {
        if (!threadId)
            throw new ZaloApiError.ZaloApiError("Missing threadId");
        const params = Object.assign(Object.assign({ [type === Enum.ThreadType.User ? "toid" : "grid"]: threadId }, (type === Enum.ThreadType.User ? { destType } : {})), { imei: ctx.imei });
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

exports.sendTypingEventFactory = sendTypingEventFactory;
