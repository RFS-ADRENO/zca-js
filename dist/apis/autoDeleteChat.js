import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/index.js";
import { apiFactory } from "../utils.js";
export var MessageTTL;
(function (MessageTTL) {
    MessageTTL[MessageTTL["NO_DELETE"] = 0] = "NO_DELETE";
    MessageTTL[MessageTTL["ONE_DAY"] = 86400000] = "ONE_DAY";
    MessageTTL[MessageTTL["SEVEN_DAYS"] = 604800000] = "SEVEN_DAYS";
    MessageTTL[MessageTTL["FOURTEEN_DAYS"] = 1209600000] = "FOURTEEN_DAYS";
    // By default there are only 4 options above and the enum below is just experimental
    MessageTTL[MessageTTL["THREE_DAYS"] = 259200000] = "THREE_DAYS";
    MessageTTL[MessageTTL["FIVE_DAYS"] = 432000000] = "FIVE_DAYS";
})(MessageTTL || (MessageTTL = {}));
export const autoDeleteChatFactory = apiFactory()((api, ctx, utils) => {
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
    return async function autoDeleteChat(ttl = MessageTTL.NO_DELETE, threadId, type = ThreadType.User) {
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
