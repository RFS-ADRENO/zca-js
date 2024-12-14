import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { GroupMessage, Message, MessageType } from "../models/Message.js";
import { apiFactory, encodeAES, makeURL, removeUndefinedKeys, request } from "../utils.js";

export type DeleteMessageResponse = {
    status: number;
};

export const deleteMessageFactory = apiFactory<DeleteMessageResponse>()((api, ctx, resolve) => {
    const URLType = {
        [MessageType.DirectMessage]: makeURL(`${api.zpwServiceMap.chat[0]}/api/message/delete`),
        [MessageType.GroupMessage]: makeURL(`${api.zpwServiceMap.group[0]}/api/group/deletemsg`),
    };
    /**
     * Delete a message
     *
     * @param message Message or GroupMessage instance
     * @param onlyMe Delete message for only you
     *
     * @throws ZaloApiError
     */
    return async function deleteMessage(message: Message | GroupMessage, onlyMe: boolean = true) {
        if (!(message instanceof Message) && !(message instanceof GroupMessage))
            throw new ZaloApiError(
                "Expected Message or GroupMessage instance, got: " + (message as unknown as any)?.constructor?.name,
            );

        if (message.isSelf && onlyMe === false)
            throw new ZaloApiError("To delete your message for everyone, use undo api instead");

        const params: any = {
            toid: message instanceof Message ? message.threadId : undefined,
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
            imei: message instanceof Message ? ctx.imei : undefined,
        };

        removeUndefinedKeys(params);

        const encryptedParams = encodeAES(ctx.secretKey, JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt message");

        const response = await request(URLType[message.type], {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return resolve(response);
    };
});
