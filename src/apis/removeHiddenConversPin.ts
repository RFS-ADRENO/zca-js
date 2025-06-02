import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/Enum.js";
import { apiFactory } from "../utils.js";

export type RemoveHiddenConversPinResponse = "";

export const removeHiddenConversPinFactory = apiFactory<RemoveHiddenConversPinResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/hiddenconvers/add-remove`);

    /**
     * Remove hidden conversation pin
     *
     * @param threadId Thread ID
     * @param type Thread type (User/Group)
     *
     * @throws ZaloApiError
     */
    return async function removeHiddenConversPin(threadId: string, type: ThreadType = ThreadType.User) {
        const params = {
            del_threads: JSON.stringify([
                {
                    thread_id: threadId,
                    is_group: type === ThreadType.Group ? 1 : 0,
                },
            ]),
            add_threads: "[]",
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
