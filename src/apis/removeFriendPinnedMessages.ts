import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";
import type { UnpinTopic } from "./removePinnedMessages.js";

// Re-export for convenience
export type { UnpinTopic };

/**
 * Response khi bỏ tin nhắn ghim trong hội thoại 1-1
 */
export type RemoveFriendPinnedMessagesResponse = {
    /** Data (thường là null khi thành công) */
    data: null;
    /** Version mới của board */
    version: number;
};

export const removeFriendPinnedMessagesFactory = apiFactory<RemoveFriendPinnedMessagesResponse>()(
    (api, ctx, utils) => {
        const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend_board[0]}/api/friendboard/multi_unpin`);

        /**
         * Bỏ tin nhắn khỏi danh sách ghim đầu hội thoại 1-1
         *
         * Lưu ý: API này chỉ bỏ tin nhắn khỏi vị trí ghim đầu hội thoại,
         * tin nhắn vẫn còn trong lịch sử ghim (getFriendBoardList).
         *
         * @param conversationId ID hội thoại (conversation ID)
         * @param topicIds Danh sách ID của các pin cần bỏ (hoặc 1 ID duy nhất)
         * @param version Phiên bản board (lấy từ getFriendBoardList hoặc pinFriendMessage response)
         *
         * @throws {ZaloApiError}
         *
         * @example
         * // Bỏ 1 tin nhắn khỏi danh sách ghim đầu hội thoại
         * await api.removeFriendPinnedMessages("3658014113694025208", "877384196", 1770199765191);
         *
         * @example
         * // Bỏ nhiều tin nhắn
         * await api.removeFriendPinnedMessages("3658014113694025208", ["877384196", "877384197"], 1770199765191);
         */
        return async function removeFriendPinnedMessages(
            conversationId: string,
            topicIds: string | string[],
            version: number = 0,
        ): Promise<RemoveFriendPinnedMessagesResponse> {
            // Normalize topicIds to array
            const ids = Array.isArray(topicIds) ? topicIds : [topicIds];

            // Build topics array
            const topics: UnpinTopic[] = ids.map((id) => ({
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
