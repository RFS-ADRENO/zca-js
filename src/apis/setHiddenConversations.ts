import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type SetHiddenConversationsResponse = "";

export const setHiddenConversationsFactory = apiFactory<SetHiddenConversationsResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/hiddenconvers/add-remove`);

    /**
     * Set hidden conversation
     *
     * @param hidden - Whether to hide or unhide the conversation
     * @param threadId Thread ID
     * @param type Thread type (User/Group)
     *
     * @throws ZaloApiError
     */
    return async function setHiddenConversations(hidden: boolean, threadId: string, type: ThreadType = ThreadType.User) {
        const params = {
            [hidden ? "add_threads" : "del_threads"]: JSON.stringify([
                {
                    thread_id: threadId,
                    is_group: type === ThreadType.Group ? 1 : 0,
                },
            ]),
            [hidden ? "del_threads" : "add_threads"]: "[]",
            imei: ctx.imei,
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
