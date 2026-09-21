import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";
export const updateArchivedChatListFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.label[0]}/api/archivedchat/update`);
    /**
     * Archive conversations
     *
     * @param isArchived - true to archive, false to unarchive
     * @param conversations - List of conversations to archive/unarchive
     *
     * @throws {ZaloApiError}
     */
    return async function updateArchivedChatList(isArchived, conversations) {
        if (!Array.isArray(conversations)) {
            conversations = [conversations];
        }
        const params = {
            actionType: isArchived ? 0 : 1,
            ids: conversations,
            imei: ctx.imei,
            version: Date.now(),
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError("Failed to encrypt message");
        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils.resolve(response);
    };
});
