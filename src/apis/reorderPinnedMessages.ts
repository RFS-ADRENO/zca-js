import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";
import type { UnpinTopic } from "./removePinnedMessages.js";

/**
 * Response khi sắp xếp lại thứ tự tin nhắn ghim trong nhóm
 */
export type ReorderPinnedMessagesResponse = "" | null;

export const reorderPinnedMessagesFactory = apiFactory<ReorderPinnedMessagesResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/pin/update`);

    /**
     * Sắp xếp lại thứ tự tin nhắn ghim đầu hội thoại nhóm
     *
     * @param groupId ID nhóm
     * @param topicIds Danh sách ID của các pin theo thứ tự mới mong muốn
     * @param boardVersion Phiên bản board (lấy từ getPinnedMessages)
     *
     * @throws {ZaloApiError}
     *
     * @example
     * // Lấy danh sách pin hiện tại
     * const pinned = await api.getPinnedMessages(groupId);
     *
     * // Đảo ngược thứ tự
     * const reversedIds = pinned.items.map(item => item.id).reverse();
     *
     * // Áp dụng thứ tự mới
     * await api.reorderPinnedMessages(
     *     groupId,
     *     reversedIds,
     *     pinned.boardVersion
     * );
     *
     * @example
     * // Di chuyển pin cuối lên đầu
     * const pinned = await api.getPinnedMessages(groupId);
     * const ids = pinned.items.map(item => item.id);
     * const lastId = ids.pop();
     * if (lastId) {
     *     ids.unshift(lastId);
     *     await api.reorderPinnedMessages(groupId, ids, pinned.boardVersion);
     * }
     */
    return async function reorderPinnedMessages(
        groupId: string,
        topicIds: string[],
        boardVersion: number = 0,
    ): Promise<ReorderPinnedMessagesResponse> {
        // Build topics array
        const topics: UnpinTopic[] = topicIds.map((id) => ({
            topicId: id,
            topicType: 2, // 2 = pin message
        }));

        const params = {
            groupId: groupId,
            topics: topics,
            boardVersion: boardVersion,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
