'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var context = require('../context.cjs');
var Enum = require('../models/Enum.cjs');
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
     * @param type Messages type (User or Group)
     * @param targetId User ID or Group ID
     * @param messages List of messages to send seen event
     *
     * @throws ZaloApiError
     */
    return async function sendSeenEvent(type, targetId, messages) {
        if (!type && type !== 0)
            throw new ZaloApiError.ZaloApiError("Missing type");
        if (!targetId)
            throw new ZaloApiError.ZaloApiError("Missing targetId");
        if (!messages || !Array.isArray(messages))
            throw new ZaloApiError.ZaloApiError("Messages are missing or not in a valid array format.");
        if (messages.length === 0 || messages.length > context.MAX_MESSAGES_PER_SEND)
            throw new ZaloApiError.ZaloApiError("Message array must contain between 1 and 50 messages.");
        const msgInfos = {
            data: messages.map((msg) => {
                if ((type === Enum.ThreadType.User && msg.uidFrom !== targetId) ||
                    (type === Enum.ThreadType.Group && msg.idTo !== targetId))
                    throw new ZaloApiError.ZaloApiError("TargetId mismatch");
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
            [type === Enum.ThreadType.User ? "senderId" : "grid"]: targetId,
        };
        const params = Object.assign({ msgInfos: JSON.stringify(msgInfos) }, (type === Enum.ThreadType.User ? {} : { imei: ctx.imei }));
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt params");
        const response = await utils.request(serviceURL[type].toString(), {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils.resolve(response);
    };
});

exports.sendSeenEventFactory = sendSeenEventFactory;
