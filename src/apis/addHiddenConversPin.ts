import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/Enum.js";
import { apiFactory } from "../utils.js";

export type AddHiddenConversPinResponse = "";

export const addHiddenConversPinFactory = apiFactory<AddHiddenConversPinResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/hiddenconvers/add-remove`);

    /**
     * Add hidden conversation pin
     *
     * @param threadId Thread ID
     * @param type Thread type (User/Group)
     *
     * @throws ZaloApiError
     */
    return async function addHiddenConversPin(threadId: string, type: ThreadType = ThreadType.User) {
        const params = {
            del_threads: "[]",
            add_threads: JSON.stringify([
                {
                    thread_id: threadId,
                    is_group: type === ThreadType.Group ? 1 : 0,
                },
            ]),
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
