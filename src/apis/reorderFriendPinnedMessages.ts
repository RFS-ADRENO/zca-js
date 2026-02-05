import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";
import type { UnpinTopic } from "./removePinnedMessages.js";

/**
 * Response khi sắp xếp lại thứ tự tin nhắn ghim trong hội thoại 1-1
 */
export type ReorderFriendPinnedMessagesResponse = {
    /** Data (thường là null khi thành công) */
    data: null;
    /** Version mới của board */
    version: number;
};

export const reorderFriendPinnedMessagesFactory = apiFactory<ReorderFriendPinnedMessagesResponse>()(
    (api, ctx, utils) => {
        const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend_board[0]}/api/friendboard/reorder`);

        /**
         * Sắp xếp lại thứ tự tin nhắn ghim đầu hội thoại 1-1
         *
         * @param conversationId ID hội thoại (conversation ID)
         * @param topicIds Danh sách ID của các pin theo thứ tự mới mong muốn
         * @param version Phiên bản board (lấy từ getFriendPinnedMessages)
         *
         * @throws {ZaloApiError}
         *
         * @example
         * // Lấy danh sách pin hiện tại
         * const pinned = await api.getFriendPinnedMessages(conversationId);
         *
         * // Đảo ngược thứ tự
         * const reversedIds = pinned.items.map(item => item.id).reverse();
         *
         * // Áp dụng thứ tự mới
         * await api.reorderFriendPinnedMessages(
         *     conversationId,
         *     reversedIds,
         *     pinned.version
         * );
         *
         * @example
         * // Di chuyển pin cuối lên đầu
         * const pinned = await api.getFriendPinnedMessages(conversationId);
         * const ids = pinned.items.map(item => item.id);
         * const lastId = ids.pop();
         * if (lastId) {
         *     ids.unshift(lastId);
         *     await api.reorderFriendPinnedMessages(conversationId, ids, pinned.version);
         * }
         */
        return async function reorderFriendPinnedMessages(
            conversationId: string,
            topicIds: string[],
            version: number = 0,
        ): Promise<ReorderFriendPinnedMessagesResponse> {
            // Build topics array
            const topics: UnpinTopic[] = topicIds.map((id) => ({
                topicId: id,
                topicType: 2, // 2 = pin message
            }));

            const params = {
                conversationId: conversationId,
                topics: topics,
                version: version,
                lang: "vi",
                imei: ctx.imei,
            };

            const encryptedParams = utils.encodeAES(JSON.stringify(params));
            if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

            const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
                method: "GET",
            });

            return utils.resolve(response);
        };
    },
);
