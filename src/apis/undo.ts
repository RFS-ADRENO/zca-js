import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { GroupMessage, UserMessage, ThreadType } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type UndoResponse = {
    status: number;
};

export const undoFactory = apiFactory<UndoResponse>()((api, ctx, utils) => {
    const URLType = {
        [ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.chat[0]}/api/message/undo`),
        [ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/undomsg`),
    };
    /**
     * Undo a message
     *
     * @param message Message or GroupMessage instance that has quote to undo
     *
     * @throws ZaloApiError
     */
    return async function undo(message: UserMessage | GroupMessage) {
        if (!(message instanceof UserMessage) && !(message instanceof GroupMessage))
            throw new ZaloApiError(
                "Expected Message or GroupMessage instance, got: " + (message as unknown as any)?.constructor?.name,
            );
        if (!message.data.quote) throw new ZaloApiError("Message does not have quote");

        const params: any = {
            msgId: message.data.quote.globalMsgId,
            clientId: Date.now(),
            cliMsgIdUndo: message.data.quote.cliMsgId,
        };

        if (message instanceof GroupMessage) {
            params["grid"] = message.threadId;
            params["visibility"] = 0;
            params["imei"] = ctx.imei;
        } else params["toid"] = message.threadId;

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt message");

        const response = await utils.request(URLType[message.type], {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
