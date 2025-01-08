import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type PinConversationsResponse = "";

export const pinConversationsFactory = apiFactory<PinConversationsResponse>()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/pinconvers/updatev2`);

    /**
     * Pin and unpin conversations of the thread (USER or GROUP)
     *
     * @param pin Should pin conversation, default true
     * @param threadId The ID of the thread (USER or GROUP)
     * @param isGroup Is group conversation, default false
     *
     * @throws ZaloApiError
     *
     */
    return async function pinConversations(pin: boolean = true, threadId: string | string[], isGroup: boolean = false) {
        if (typeof threadId == "string") threadId = [threadId];

        const params = {
            actionType: pin ? 1 : 2,
            conversations: isGroup ? threadId.map((id) => `g${id}`) : threadId.map((id) => `u${id}`),
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
