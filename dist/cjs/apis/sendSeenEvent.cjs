'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var context = require('../context.cjs');
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

const sendSeenEventFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = {
        [Enum.ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.chat[0]}/api/message/seenv2`, {
            nretry: 0,
        }),
        [Enum.ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/seenv2`, {
            nretry: 0,
        }),
    };
    /**
     * Send message seen event
     *
     * @param messages List of messages to send seen event
     * @param type Messages type (User or Group), defaults to User
     *
     * @throws {ZaloApiError}
     */
    return async function sendSeenEvent(messages, type = Enum.ThreadType.User) {
        if (!messages)
            throw new ZaloApiError.ZaloApiError("messages are missing or not in a valid array format.");
        if (!Array.isArray(messages))
            messages = [messages];
        if (messages.length === 0 || messages.length > context.MAX_MESSAGES_PER_SEND)
            throw new ZaloApiError.ZaloApiError("messages must contain between 1 and 50 messages.");
        const isGroup = type === Enum.ThreadType.Group;
        const threadId = isGroup ? messages[0].idTo : messages[0].uidFrom;
        const msgInfos = {
            data: messages.map((msg) => {
                const curThreadId = isGroup ? msg.idTo : msg.uidFrom;
                if (curThreadId !== threadId) {
                    throw new ZaloApiError.ZaloApiError("All messages must belong to the same thread.");
                }
                return {
                    cmi: msg.cliMsgId,
                    gmi: msg.msgId,
                    si: msg.uidFrom,
                    di: msg.idTo === ctx.uid ? "0" : msg.idTo,
                    mt: msg.msgType,
                    st: msg.st || 0 === msg.st ? 0 : -1,
                    at: msg.at || 0 === msg.at ? 0 : -1,
                    cmd: msg.cmd || 0 === msg.cmd ? 0 : -1,
                    ts: parseInt(`${msg.ts}`) || 0 === parseInt(`${msg.ts}`) ? 0 : -1,
                };
            }),
            [isGroup ? "grid" : "senderId"]: threadId,
        };
        const params = Object.assign({ msgInfos: JSON.stringify(msgInfos) }, (isGroup ? { imei: ctx.imei } : {}));
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

exports.sendSeenEventFactory = sendSeenEventFactory;
