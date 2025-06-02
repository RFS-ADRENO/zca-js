import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/index.js";
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
     * @param ttl The time to live of the chat (in milliseconds). Use MessageTTL enum for predefined values
     * @param threadId The thread ID to auto delete chat
     * @param type Type of thread (User or Group)
     *
     * @throws ZaloApiError
     */
    return async function autoDeleteChat(
        ttl: MessageTTL | number = MessageTTL.NO_DELETE,
        threadId: string,
        type: ThreadType = ThreadType.User,
    ) {
        const params = {
            threadId: threadId,
            isGroup: type === ThreadType.Group ? 1 : 0,
            ttl: ttl,
            clientLang: ctx.language,
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
