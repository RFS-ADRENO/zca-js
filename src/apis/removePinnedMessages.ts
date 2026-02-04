import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

/**
 * Thông tin topic cần bỏ khỏi danh sách ghim đầu hội thoại
 */
export type UnpinTopic = {
    /** ID của pin */
    topicId: string;
    /** Loại topic (2 = pin message) */
    topicType?: number;
};

export type RemovePinnedMessagesResponse = "" | number;

export const removePinnedMessagesFactory = apiFactory<RemovePinnedMessagesResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/multi_unpin`);

    /**
     * Bỏ tin nhắn khỏi danh sách ghim đầu hội thoại
     *
     * Lưu ý: API này chỉ bỏ tin nhắn khỏi vị trí ghim đầu hội thoại,
     * tin nhắn vẫn còn trong lịch sử ghim (getListBoard).
     * Khác với unpinMessage sẽ xóa hoàn toàn khỏi lịch sử ghim.
     *
     * @param groupId ID nhóm
     * @param topicIds Danh sách ID của các pin cần bỏ (hoặc 1 ID duy nhất)
     * @param boardVersion Phiên bản board (lấy từ getPinnedMessages)
     *
     * @throws {ZaloApiError}
     *
     * @example
     * // Bỏ 1 tin nhắn khỏi danh sách ghim đầu hội thoại
     * await api.removePinnedMessages("8330281778886679712", "873815411", 1769826095499);
     *
     * @example
     * // Bỏ nhiều tin nhắn
     * await api.removePinnedMessages("8330281778886679712", ["873815411", "873815412"], 1769826095499);
     *
     * @example
     * // Bỏ tất cả tin nhắn ghim đầu hội thoại
     * const pinned = await api.getPinnedMessages(groupId);
     * const topicIds = pinned.items.map(item => item.id);
     * await api.removePinnedMessages(groupId, topicIds, pinned.boardVersion);
     */
    return async function removePinnedMessages(
        groupId: string,
        topicIds: string | string[],
        boardVersion: number = 0,
    ): Promise<RemovePinnedMessagesResponse> {
        // Normalize topicIds to array
        const ids = Array.isArray(topicIds) ? topicIds : [topicIds];

        // Build topics array
        const topics: UnpinTopic[] = ids.map((id) => ({
            topicId: id,
            topicType: 2, // 2 = pin message
        }));

        const params = {
            grid: groupId,
            topics: topics,
            boardVersion: boardVersion,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const url = serviceURL + "&params=" + encodeURIComponent(encryptedParams);

        const response = await utils.request(url, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
