import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type PinConversationsResponse = "";

export const pinConversationsFactory = apiFactory<PinConversationsResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/pinconvers/updatev2`);

    /**
     * Pin and unpin conversations of the thread (USER or GROUP)
     *
     * @param threadId The ID of the thread (USER or GROUP)
     * @param threadType The threadType 0 for User, 1 for Group
     * @param actionType Using 1 = pin, 2 = unpin
     *
     * @throws ZaloApiError
     *
     */
    return async function pinConversations(threadId: string[], threadType: number, actionType: number = 1) {
        const conversationUser = threadId.map((id) => `u${id}`);
        const conversationGroup = threadId.map((id) => `g${id}`);

        const params: any = {
            actionType: actionType,
        };

        if (threadType === 0) {
            params.conversations = conversationUser;
        } else if (threadType === 1) {
            params.conversations = conversationGroup;
        } else {
            throw new ZaloApiError("Thread type is invalid");
        }

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
