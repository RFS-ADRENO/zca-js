import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/index.js";
import { apiFactory } from "../utils.js";
export const deleteMessageFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = {
        [ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.chat[0]}/api/message/delete`),
        [ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/deletemsg`),
    };
    /**
     * Delete a message
     *
     * @param dest Delete target
     * @param onlyMe Delete message for only you
     *
     * @throws {ZaloApiError}
     */
    return async function deleteMessage(dest, onlyMe = false) {
        const { threadId, type = ThreadType.User, data } = dest;
        const isGroup = type === ThreadType.Group;
        const isSelf = ctx.uid == data.uidFrom;
        if (isSelf && onlyMe === false)
            throw new ZaloApiError("To delete your message for everyone, use undo api instead");
        if (!isGroup && onlyMe === false)
            throw new ZaloApiError("Can't delete message for everyone in a private chat");
        const params = {
            [isGroup ? "grid" : "toid"]: threadId,
            cliMsgId: Date.now(),
            msgs: [
                {
                    cliMsgId: data.cliMsgId,
                    globalMsgId: data.msgId,
                    ownerId: data.uidFrom,
                    destId: threadId,
                },
            ],
            onlyMe: onlyMe ? 1 : 0,
        };
        if (!isGroup) {
            params.imei = ctx.imei;
        }
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError("Failed to encrypt message");
        const response = await utils.request(serviceURL[type], {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils.resolve(response);
    };
});
