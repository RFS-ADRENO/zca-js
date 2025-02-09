import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { GroupMessage, UserMessage, ThreadType } from "../models/index.js";
import { apiFactory, removeUndefinedKeys } from "../utils.js";

export type DeleteMessageResponse = {
    status: number;
};

export const deleteMessageFactory = apiFactory<DeleteMessageResponse>()((api, ctx, utils) => {
    const serviceURL = {
        [ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.chat[0]}/api/message/delete`),
        [ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/deletemsg`),
    };
    /**
     * Delete a message
     *
     * @param message Message or GroupMessage instance
     * @param onlyMe Delete message for only you
     *
     * @throws ZaloApiError
     */
    return async function deleteMessage(message: UserMessage | GroupMessage, onlyMe: boolean = true) {
        if (!(message instanceof UserMessage) && !(message instanceof GroupMessage))
            throw new ZaloApiError(
                "Expected Message or GroupMessage instance, got: " + (message as unknown as any)?.constructor?.name,
            );

        if (message.isSelf && onlyMe === false)
            throw new ZaloApiError("To delete your message for everyone, use undo api instead");

        const params: any = {
            toid: message instanceof UserMessage ? message.threadId : undefined,
            grid: message instanceof GroupMessage ? message.threadId : undefined,
            cliMsgId: Date.now(),
            msgs: [
                {
                    cliMsgId: String(message.data.cliMsgId),
                    globalMsgId: String(message.data.msgId),
                    ownerId: String(message.data.uidFrom),
                    destId: String(message.threadId),
                },
            ],
            onlyMe: onlyMe ? 1 : 0,
            imei: message instanceof UserMessage ? ctx.imei : undefined,
        };

        removeUndefinedKeys(params);

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt message");

        const response = await utils.request(serviceURL[message.type], {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
