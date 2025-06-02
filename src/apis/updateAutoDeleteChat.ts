import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type UpdateAutoDeleteChatResponse = "";

export const updateAutoDeleteChatFactory = apiFactory<UpdateAutoDeleteChatResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/conv/autodelete/updateConvers`);

    /**
     * Update auto delete chat
     * 
     * @param ttl - The time to live for the autoDeleteMessage of API
     * @param threadId - The ID of the thread to update
     * @param isGroup - Whether the thread is a group
     *
     * @throws ZaloApiError
     */
    return async function updateAutoDeleteChat(ttl: number = 0, threadId: string, isGroup: ThreadType = ThreadType.Group) {
        const params = {
            "threadId": threadId,
            "isGroup": isGroup === ThreadType.Group ? 1 : 0,
            "ttl": ttl, // time update autoDeleteMessage
            "clientLang": ctx.language
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
