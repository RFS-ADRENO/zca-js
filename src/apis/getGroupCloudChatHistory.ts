import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

import { GroupMessage, type TGroupMessage } from "../models/index.js";

export type GetGroupCloudChatHistoryResponse = {
    groupMsgs: GroupMessage[];
    /**
     * Whether there are older messages in the current storage.
     * Keep paginating while `hasMore || isOld` (see `isOld`).
     */
    hasMore: boolean;
    /**
     * Message id to use as the cursor for the next (older) page
     */
    lastMsgId: string;
    /**
     * Set by the server when the next (older) page lives in the old-message storage
     * (`getoldv2`). It can be `true` while `hasMore` is `false`: the recent storage is exhausted
     * but older messages remain. Pass it back to `getGroupCloudChatHistory` so the next
     * request goes to the right endpoint, as Zalo Web does.
     */
    isOld: boolean;
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
    isOld?: number | boolean;
    isFiltered?: number | boolean;
};

export const getGroupCloudChatHistoryFactory = apiFactory<GetGroupCloudChatHistoryResponse>()((api, ctx, utils) => {
    const recentURL = utils.makeURL(`${api.zpwServiceMap.group_cloud_message[0]}/api/cm/getrecentv2`);
    const oldURL = utils.makeURL(`${api.zpwServiceMap.group_cloud_message[0]}/api/cm/getoldv2`);

    /**
     * Get group chat history from Zalo's cloud message service.
     *
     * Each call returns one page (up to 50 messages, the page size Zalo Web uses; the server
     * rejects larger values). To get older messages, pass the previous response's `lastMsgId`
     * and `isOld` back in, the same way Zalo Web does when scrolling up:
     * pages are loaded from `getrecentv2`, and only from `getoldv2` once the server answers `isOld`.
     *
     * @example
     * let page = await api.getGroupCloudChatHistory(groupId);
     * while (page.hasMore || page.isOld) {
     *     page = await api.getGroupCloudChatHistory(groupId, page.lastMsgId, page.isOld);
     * }
     *
     * @param groupId group id
     * @param lastMsgId fetch messages older than this message id (`lastMsgId` from the previous response). Omit to get the latest messages.
     * @param isOld `isOld` from the previous response
     *
     * @throws {ZaloApiError}
     */
    return async function getGroupCloudChatHistory(groupId: string, lastMsgId?: string, isOld: boolean = false) {
        if (!groupId) throw new ZaloApiError("Missing groupId");

        const params = {
            groupId: groupId,
            globalMsgId: lastMsgId ?? "0",
            count: 50,
            msgIds: [],
            imei: ctx.imei,
            src: -1,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        // `nretry` is required: without it the server answers with error 604 (session error)
        const response = await utils.request(
            utils.makeURL(isOld ? oldURL : recentURL, { params: encryptedParams, nretry: 0 }),
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

                const groupMsgs = (data.groupMsgs ?? []).map((msg) => new GroupMessage(ctx.uid, msg));

                return {
                    groupMsgs,
                    hasMore: Boolean(data.hasMore),
                    lastMsgId: data.lastMsgId != null ? String(data.lastMsgId) : "",
                    isOld: Boolean(data.isOld),
                    isFiltered: Boolean(data.isFiltered),
                };
            });
        } catch (err) {
            // -69 "Stop retry": the server has nothing more this session can load
            if (err instanceof ZaloApiError && err.code === -69) {
                return { groupMsgs: [], hasMore: false, lastMsgId: "", isOld: false, isFiltered: false };
            }
            throw err;
        }
    };
});
