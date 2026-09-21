import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/index.js";
import { apiFactory } from "../utils.js";
export var ChatTTL;
(function (ChatTTL) {
    ChatTTL[ChatTTL["NO_DELETE"] = 0] = "NO_DELETE";
    ChatTTL[ChatTTL["ONE_DAY"] = 86400000] = "ONE_DAY";
    ChatTTL[ChatTTL["SEVEN_DAYS"] = 604800000] = "SEVEN_DAYS";
    ChatTTL[ChatTTL["FOURTEEN_DAYS"] = 1209600000] = "FOURTEEN_DAYS";
})(ChatTTL || (ChatTTL = {}));
export const updateAutoDeleteChatFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/conv/autodelete/updateConvers`);
    /**
     * Auto delete chat
     *
     * @param ttl The time to live of the chat
     * @param threadId The thread ID to auto delete chat
     * @param type Type of thread (User or Group)
     *
     * @throws {ZaloApiError}
     */
    return async function updateAutoDeleteChat(ttl, threadId, type = ThreadType.User) {
        const params = {
            threadId: threadId,
            isGroup: type === ThreadType.Group ? 1 : 0,
            ttl: ttl,
            clientLang: ctx.language,
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError("Failed to encrypt params");
        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils.resolve(response);
    };
});
