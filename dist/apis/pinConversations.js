import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/index.js";
import { apiFactory } from "../utils.js";
export const pinConversationsFactory = apiFactory()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/pinconvers/updatev2`);
    /**
     * Pin and unpin conversations of the thread (USER or GROUP)
     *
     * @param pin Should pin conversations
     * @param threadId The ID(s) of the thread (USER or GROUP)
     * @param type Type of thread, default user
     *
     * @throws ZaloApiError
     *
     */
    return async function pinConversations(pin, threadId, type = ThreadType.User) {
        if (typeof threadId == "string")
            threadId = [threadId];
        const params = {
            actionType: pin ? 1 : 2,
            conversations: type == ThreadType.Group ? threadId.map((id) => `g${id}`) : threadId.map((id) => `u${id}`),
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
