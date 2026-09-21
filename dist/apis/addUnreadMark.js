import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/index.js";
import { apiFactory } from "../utils.js";
export const addUnreadMarkFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/conv/addUnreadMark`);
    /**
     * Add unread mark to conversation
     *
     * @param threadId Thread ID
     * @param type Thread type (User/Group)
     *
     * @throws {ZaloApiError}
     */
    return async function addUnreadMark(threadId, type = ThreadType.User) {
        const timestamp = Date.now();
        const timestampString = timestamp.toString();
        const isGroup = type === ThreadType.Group;
        const requestParams = {
            param: JSON.stringify({
                [isGroup ? "convsGroup" : "convsUser"]: [
                    {
                        id: threadId,
                        cliMsgId: timestampString,
                        fromUid: "0",
                        ts: timestamp,
                    },
                ],
                [isGroup ? "convsUser" : "convsGroup"]: [],
                imei: ctx.imei,
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
