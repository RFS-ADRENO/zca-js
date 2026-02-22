import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

import type { ThreadType } from "../models/Enum.js";

export type UpdateArchivedChatListTarget = { id: string; type: ThreadType };

export type UpdateArchivedChatListResponse = { needResync: boolean; version: number };

export const updateArchivedChatListFactory = apiFactory<UpdateArchivedChatListResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.label[0]}/api/archivedchat/update`);

    /**
     * Archive conversations
     *
     * @param isArchived - true to archive, false to unarchive
     * @param conversations - List of conversations to archive/unarchive
     *
     * @throws {ZaloApiError}
     */
    return async function updateArchivedChatList(isArchived: boolean, conversations: UpdateArchivedChatListTarget | UpdateArchivedChatListTarget[]) {
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
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt message");

        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
