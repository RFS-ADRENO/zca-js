import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export enum MessageTTL {
    NO_DELETE = 0,
    ONE_DAY = 86400000,
    SEVEN_DAYS = 604800000,
    FOURTEEN_DAYS = 1209600000,

    // By default there are only 4 options above and the enum below is just experimental
    THREE_DAYS = 259200000,
    FIVE_DAYS = 432000000,
}

export type AutoDeleteChatResponse = "";

export const autoDeleteChatFactory = apiFactory<AutoDeleteChatResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/conv/autodelete/updateConvers`);

    /**
     * Auto delete chat
     *
     * @param threadId The thread ID to auto delete chat
     * @param isGroup Whether the thread is a group (0 = not a group, 1 = is a group)
     * @param ttl The time to live of the chat (in milliseconds)
     *
     * @throws ZaloApiError
     */
    return async function autoDeleteChat(threadId: string, isGroup: boolean, ttl?: number) {
        const params = {
            threadId: threadId,
            isGroup: isGroup ? 1 : 0,
            ttl: ttl ?? 0,
            language: ctx.language, 
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
