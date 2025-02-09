import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type UndoOptions = {
    msgId: string | number;
    cliMsgId: string | number;
};

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
    return async function undo(options: UndoOptions, threadId: string, type: ThreadType) {
        const params: any = {
            msgId: options.msgId,
            clientId: Date.now(),
            cliMsgIdUndo: options.cliMsgId,
        };

        if (type == ThreadType.Group) {
            params["grid"] = threadId;
            params["visibility"] = 0;
            params["imei"] = ctx.imei;
        } else params["toid"] = threadId;

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt message");

        const response = await utils.request(URLType[type], {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
