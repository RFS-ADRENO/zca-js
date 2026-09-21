import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/index.js";
import { apiFactory } from "../utils.js";
export const deleteChatFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = {
        [ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.chat[0]}/api/message/deleteconver`, {
            nretry: 0,
        }),
        [ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/deleteconver`, {
            nretry: 0,
        }),
    };
    /**
     * Delete chat
     *
     * @param lastMessage Last message info
     * @param threadId Thread ID
     * @param type Thread type
     *
     * @throws {ZaloApiError}
     */
    return async function deleteChat(lastMessage, threadId, type = ThreadType.User) {
        const timestampString = Date.now().toString();
        const params = type === ThreadType.User
            ? {
                toid: threadId,
                cliMsgId: timestampString,
                conver: lastMessage,
                onlyMe: 1,
                imei: ctx.imei,
            }
            : {
                grid: threadId,
                cliMsgId: timestampString,
                conver: lastMessage,
                onlyMe: 1,
                imei: ctx.imei,
            };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError("Failed to encrypt params");
        const response = await utils.request(serviceURL[type], {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils.resolve(response);
    };
});
