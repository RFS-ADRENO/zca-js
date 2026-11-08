import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

import { GroupMessage, type TGroupMessage } from "../models/index.js";

export type GetGroupCloudChatHistoryResponse = {
    groupMsgs: GroupMessage[];
    /**
     * Whether there are older messages to fetch.
     * Pass `lastMsgId` back to `getGroupCloudChatHistory` to get the next (older) page.
     */
    hasMore: boolean;
    /**
     * Message id to use as the cursor for the next (older) page
     */
    lastMsgId: string;
    /**
     * Zalo hides messages this session is not allowed to see (e.g. messages sent before
     * this device/session logged in that were never synced to it). When `true`,
     * `groupMsgs` may be incomplete or empty even though `hasMore` is set.
     */
    isFiltered: boolean;
};

type RawGroupCloudChatHistoryResponse = {
    groupMsgs?: TGroupMessage[];
    hasMore?: number | boolean;
    lastMsgId?: string | number;
    isFiltered?: number | boolean;
};

export const getGroupCloudChatHistoryFactory = apiFactory<GetGroupCloudChatHistoryResponse>()(
    (api, ctx, utils) => {
        const recentURL = utils.makeURL(
            `${api.zpwServiceMap.group_cloud_message[0]}/api/cm/getrecentv2`,
        );
        const oldURL = utils.makeURL(
            `${api.zpwServiceMap.group_cloud_message[0]}/api/cm/getoldv2`,
        );

        /**
         * Get group chat history from Zalo's cloud message service.
         *
         * Uses `getrecentv2` for the latest page and `getoldv2` for older pages
         * (paginated by `globalMsgId`).
         *
         * @param groupId group id
         * @param count count of messages to return (default: 50)
         * @param lastMsgId fetch messages older than this message id (use `lastMsgId` from the previous response to paginate). Omit to get the latest messages.
         *
         * @throws {ZaloApiError}
         */
        return async function getGroupCloudChatHistory(
            groupId: string,
            count: number = 50,
            lastMsgId?: string,
        ) {
            if (!groupId) throw new ZaloApiError("Missing groupId");

            const params = {
                groupId: groupId,
                globalMsgId: lastMsgId ?? "0",
                count: count,
                msgIds: [],
                imei: ctx.imei,
                src: -1,
            };

            const encryptedParams = utils.encodeAES(JSON.stringify(params));
            if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

            const response = await utils.request(
                utils.makeURL(lastMsgId ? oldURL : recentURL, { params: encryptedParams, nretry: 0 }),
                {
                    method: "GET",
                },
            );

            try {
                return await utils.resolve(response, (result) => {
                    let data = result.data as unknown as RawGroupCloudChatHistoryResponse | string;

                    if (typeof data === "string") {
                        data = JSON.parse(data) as RawGroupCloudChatHistoryResponse;
                    }

                    const groupMsgs = (data.groupMsgs ?? []).map(
                        (msg) => new GroupMessage(ctx.uid, msg),
                    );

                    return {
                        groupMsgs,
                        hasMore: Boolean(data.hasMore),
                        lastMsgId: data.lastMsgId != null ? String(data.lastMsgId) : "",
                        isFiltered: Boolean(data.isFiltered),
                    };
                });
            } catch (err) {
                if (err instanceof ZaloApiError && err.code === -69) {
                    return { groupMsgs: [], hasMore: false, lastMsgId: "", isFiltered: false };
                }
                throw err;
            }
        };
    },
);
