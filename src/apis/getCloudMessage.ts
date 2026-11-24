import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

import { GroupMessage, type TGroupMessage } from "../models/index.js";

export type GetCloudMessageOptions = {
    /**
     * `isOld` from the previous response. When `true` the request goes to the old-message
     * storage (`getoldv2`) instead of the recent one (`getrecentv2`) (default: false)
     */
    isOld?: boolean | number;
    /**
     * Ids of the messages you already have for the range being loaded, sent as `msgIds` (default: [])
     */
    localMsgIds?: string[];
    /**
     * Set to `true` for the "send to me" (My Cloud) conversation (default: false)
     */
    isOA?: boolean;
};

export type GetCloudMessageResponse = {
    error: number;
    groupMsgs: GroupMessage[];
    /**
     * Message id to use as the cursor for the next (older) page
     */
    lastMsgId: string;
    minMsgId: string;
    maxMsgId: string;
    msgJumpId: string;
    /**
     * `1` when there are older messages to load, `0` otherwise. Keep paginating only while this is `1`.
     */
    hasMore: number;
    /**
     * `1` when the next (older) page must be requested from the old-message storage, `0` otherwise.
     * Pass it back as `options.isOld` in the next call. It does not tell whether more messages exist.
     */
    isOld: number;
    /**
     * When `1` and `groupMsgs` is empty, stop paginating.
     */
    isFiltered: number;
    isFilteredByPhase: number;
    isFilteredByTimeJoin: number;
    rootMsgId: string | null;
    isRootDel: number;
    tsJoinGroup: number | null;
};

type RawCloudMessageResponse = Omit<GetCloudMessageResponse, "groupMsgs"> & {
    groupMsgs?: TGroupMessage[];
};

/**
 * Value of the `src` param, tells the server why the request is made.
 * Zalo Web also has `RETRY = 2` and `RETRY_API = 4`, unused here since this API does not retry.
 */
const CloudMessageSource = {
    /** first load of the newest messages */
    OVERFLOW: 1,
    /** load older messages from a cursor */
    LOADMORE: 3,
} as const;

export const getCloudMessageFactory = apiFactory<GetCloudMessageResponse>()((api, ctx, utils) => {
    const recentURL = utils.makeURL(`${api.zpwServiceMap.group_cloud_message[0]}/api/cm/getrecentv2`);
    const oldURL = utils.makeURL(`${api.zpwServiceMap.group_cloud_message[0]}/api/cm/getoldv2`);

    /**
     * Get group messages from Zalo's cloud message service.
     *
     * Each call sends one request and returns one page (up to 50 messages).
     * To get older messages, pass the previous response's `lastMsgId` and `isOld` back in.
     *
     * @example
     * let page = await api.getCloudMessage(groupId);
     * while (page.hasMore) {
     *     const next = await api.getCloudMessage(groupId, page.lastMsgId, { isOld: page.isOld });
     *     if (!next.groupMsgs.length && (next.isFiltered || next.lastMsgId === page.lastMsgId)) break;
     *     page = next;
     * }
     *
     * @param groupId group id
     * @param lastMsgId fetch messages older than this message id (`lastMsgId` from the previous response). Omit to get the latest messages.
     * @param options additional options
     *
     * @throws {ZaloApiError} When something went wrong, with `error.code`
     * - `-69` - Stop retry: the server has nothing more to load for this request, stop paging
     */
    return async function getCloudMessage(groupId: string, lastMsgId?: string, options?: GetCloudMessageOptions) {
        if (!groupId) throw new ZaloApiError("Missing groupId");
        if (groupId.startsWith("g")) groupId = groupId.slice(1);

        const isOld = options?.isOld ?? false;

        const params: Record<string, unknown> = {
            groupId: groupId,
            globalMsgId: lastMsgId || "0",
            count: 50,
            msgIds: options?.localMsgIds ?? [],
            imei: ctx.imei,
        };
        if (options?.isOA) params.isOA = 1;
        params.src = lastMsgId ? CloudMessageSource.LOADMORE : CloudMessageSource.OVERFLOW;

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(
            utils.makeURL(isOld ? oldURL : recentURL, { params: encryptedParams, nretry: 0 }),
            {
                method: "GET",
            },
        );

        return utils.resolve(response, (result) => {
            let data = result.data as unknown as RawCloudMessageResponse | string;

            if (typeof data === "string") {
                data = JSON.parse(data) as RawCloudMessageResponse;
            }

            return {
                ...data,
                groupMsgs: (data.groupMsgs ?? []).map((msg) => new GroupMessage(ctx.uid, msg)),
            };
        });
    };
});
