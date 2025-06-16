import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { MAX_MESSAGES_PER_SEND } from "../context.js";
import { ThreadType } from "../models/Enum.js";
import { apiFactory } from "../utils.js";
export const sendSeenEventFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = {
        [ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.chat[0]}/api/message/seenv2`, {
            nretry: 0,
        }),
        [ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/seenv2`, {
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
            throw new ZaloApiError("Missing type");
        if (!targetId)
            throw new ZaloApiError("Missing targetId");
        if (!messages || !Array.isArray(messages))
            throw new ZaloApiError("Messages are missing or not in a valid array format.");
        if (messages.length === 0 || messages.length > MAX_MESSAGES_PER_SEND)
            throw new ZaloApiError("Message array must contain between 1 and 50 messages.");
        const msgInfos = {
            data: messages.map((msg) => {
                if ((type === ThreadType.User && msg.uidFrom !== targetId) ||
                    (type === ThreadType.Group && msg.idTo !== targetId))
                    throw new ZaloApiError("TargetId mismatch");
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
            [type === ThreadType.User ? "senderId" : "grid"]: targetId,
        };
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
