import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

import { GroupMessage, type TGroupMessage } from "../models/index.js";

export type GetGroupChatHistoryResponse = {
    error?: number;
    lastMsgId?: number;
    minMsgId?: number;
    maxMsgId?: number;
    msgJumpId?: number;
    hasMore?: boolean;
    isOld?: boolean;
    isFiltered?: boolean;
    rootMsgId?: number;
    isRootDel?: boolean;
    groupMsgs: GroupMessage[];
    tsJoinGroup?: number;
    isFilteredByPhase?: boolean;
    isFilteredByTimeJoin?: boolean;
};

export const getGroupChatHistoryFactory = apiFactory<GetGroupChatHistoryResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_cloud_message[0]}/api/cm/getrecentv2`);

    /**
     * Get group chat history from Zalo Cloud Message (newest first)
     *
     * @param groupId group id
     * @param count count of messages to return (default: 50, max safe limit: 200)
     *
     * @throws {ZaloApiError}
     */
    return async function getGroupChatHistory(groupId: string, count: number = 50) {
        if (!groupId) throw new ZaloApiError("Missing groupId");
        if (groupId.startsWith("g")) groupId = groupId.slice(1);

        const safeCount = Math.min(Math.max(count, 1), 200);
        const messages: TGroupMessage[] = [];
        let cursor = 0;
        let lastPage: GetGroupChatHistoryResponse | null = null;
        let pageCount = 0;

        while (messages.length < safeCount && pageCount < 10) {
            pageCount++;
            const params = {
                groupId,
                globalMsgId: cursor,
                count: Math.min(50, safeCount - messages.length),
                msgIds: [],
                imei: ctx.imei,
                src: 3,
            };

            const encryptedParams = utils.encodeAES(JSON.stringify(params));
            if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

            const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams, nretry: 0 }), {
                method: "GET",
            });

            lastPage = await utils.resolve(response, (result) => {
                let data = result.data as unknown as GetGroupChatHistoryResponse | string;

                if (typeof data === "string") {
                    data = JSON.parse(data) as GetGroupChatHistoryResponse;
                }

                return data;
            });

            if (!lastPage || !Array.isArray(lastPage.groupMsgs)) break;

            for (const rawMsg of lastPage.groupMsgs as unknown as TGroupMessage[]) {
                if (messages.length >= safeCount) break;
                if (messages.some((m) => m.msgId === rawMsg.msgId)) continue;
                messages.push(rawMsg);
            }

            const nextCursor = Number(lastPage.lastMsgId);
            if (!lastPage.hasMore || !nextCursor || nextCursor === cursor) break;
            cursor = nextCursor;
        }

        const groupMsgs: GroupMessage[] = messages.map((data) => new GroupMessage(ctx.uid, data));
        return Object.assign({}, lastPage || {}, { groupMsgs }) as GetGroupChatHistoryResponse;
    };
});
