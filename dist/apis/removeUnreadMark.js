import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/Enum.js";
import { apiFactory } from "../utils.js";
export const removeUnreadMarkFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/conv/removeUnreadMark`);
    /**
     * Remove unread mark from conversation
     *
     * @param threadId Thread ID
     * @param type Thread type (User/Group)
     *
     * @throws ZaloApiError
     */
    return async function removeUnreadMark(threadId, type = ThreadType.User) {
        const timestamp = Date.now();
        const requestParams = {
            param: JSON.stringify({
                convsGroup: type === ThreadType.Group ? [threadId] : [],
                convsUser: type === ThreadType.User ? [threadId] : [],
                convsGroupData: type === ThreadType.Group
                    ? [
                        {
                            id: threadId,
                            ts: timestamp,
                        },
                    ]
                    : [],
                convsUserData: type === ThreadType.User
                    ? [
                        {
                            id: threadId,
                            ts: timestamp,
                        },
                    ]
                    : [],
            }),
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(requestParams));
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
