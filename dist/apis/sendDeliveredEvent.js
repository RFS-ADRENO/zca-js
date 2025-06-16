import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { MAX_MESSAGES_PER_SEND } from "../context.js";
import { ThreadType } from "../models/Enum.js";
import { apiFactory } from "../utils.js";
export const sendDeliveredEventFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = {
        [ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.chat[0]}/api/message/deliveredv2`),
        [ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/deliveredv2`),
    };
    /**
     * Send message delivered event
     *
     * @param type Messages type (User or Group)
     * @param messages List of messages to send delivered event
     * @param isSeen Whether the message is seen or not (default: false)
     *
     * @throws ZaloApiError
     */
    return async function sendDeliveredEvent(type, messages, isSeen = false) {
        if (!type && type !== 0)
            throw new ZaloApiError("Missing type");
        if (!messages || !Array.isArray(messages))
            throw new ZaloApiError("Messages are missing or not in a valid array format.");
        if (messages.length === 0 || messages.length > MAX_MESSAGES_PER_SEND)
            throw new ZaloApiError("Message array must contain between 1 and 50 messages.");
        // 27/02/2025
        // This can send messages from multiple groups, but to prevent potential issues,
        // we will restrict it to sending messages only within the same group.
        const idTo = messages[0].idTo;
        if (type === ThreadType.Group && !messages.every((msg) => msg.idTo === idTo))
            throw new ZaloApiError("All messages must have the same idTo for Group thread");
        const msgInfos = Object.assign({ seen: isSeen ? 1 : 0, data: messages.map((msg) => ({
                cmi: msg.cliMsgId,
                gmi: msg.msgId,
                si: msg.uidFrom,
                di: msg.idTo === ctx.uid ? "0" : msg.idTo,
                mt: msg.msgType,
                st: msg.st || 0 === msg.st ? 0 : -1,
                at: msg.at || 0 === msg.at ? 0 : -1,
                cmd: msg.cmd || 0 === msg.cmd ? 0 : -1,
                ts: parseInt(`${msg.ts}`) || 0 === parseInt(`${msg.ts}`) ? 0 : -1,
            })) }, (type === ThreadType.User ? {} : { grid: idTo }));
        const params = Object.assign({ msgInfos: JSON.stringify(msgInfos) }, (type === ThreadType.User ? {} : { imei: ctx.imei }));
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError("Failed to encrypt params");
        const response = await utils.request(serviceURL[type].toString(), {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils.resolve(response);
    };
});
