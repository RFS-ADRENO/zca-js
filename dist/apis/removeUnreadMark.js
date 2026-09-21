import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/index.js";
import { apiFactory } from "../utils.js";
export const removeUnreadMarkFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/conv/removeUnreadMark`);
    /**
     * Remove unread mark from conversation
     *
     * @param threadId Thread ID
     * @param type Thread type (User/Group)
     *
     * @throws {ZaloApiError}
     */
    return async function removeUnreadMark(threadId, type = ThreadType.User) {
        const timestamp = Date.now();
        const isGroup = type === ThreadType.Group;
        const requestParams = {
            param: JSON.stringify({
                [isGroup ? "convsGroup" : "convsUser"]: [threadId],
                [isGroup ? "convsUser" : "convsGroup"]: [],
                [isGroup ? "convsGroupData" : "convsUserData"]: [
                    {
                        id: threadId,
                        ts: timestamp,
                    },
                ],
                [isGroup ? "convsUserData" : "convsGroupData"]: [],
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
        return utils.resolve(response, (result) => {
            const data = result.data;
            if (typeof data.data === "string") {
                return {
                    data: JSON.parse(data.data),
                    status: data.status,
                };
            }
            return result.data;
        });
    };
});
