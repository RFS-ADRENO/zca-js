import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";
import type { PinnedMessageItem } from "./getPinnedMessages.js";

// Re-export for convenience
export type { PinnedMessageItem };

/**
 * Response khi lấy danh sách tin nhắn ghim trong hội thoại 1-1
 */
export type GetFriendPinnedMessagesResponse = {
    /** Danh sách tin nhắn được ghim */
    items: PinnedMessageItem[];
    /** Phiên bản board */
    version: number;
};

export const getFriendPinnedMessagesFactory = apiFactory<GetFriendPinnedMessagesResponse>()(
    (api, ctx, utils) => {
        const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend_board[0]}/api/friendboard/list`);

        /**
         * Lấy danh sách tin nhắn được ghim trong hội thoại 1-1
         *
         * @param conversationId ID hội thoại (conversation ID)
         * @param version Phiên bản board (mặc định 0 để lấy mới nhất)
         *
         * @throws {ZaloApiError}
         *
         * @example
         * // Lấy danh sách tin nhắn ghim
         * const result = await api.getFriendPinnedMessages("3658014113694025208");
         * console.log(result.items);
         * console.log(result.version);
         *
         * @example
         * // Sử dụng với removeFriendPinnedMessages
         * const pinned = await api.getFriendPinnedMessages(conversationId);
         * if (pinned.items.length > 0) {
         *     await api.removeFriendPinnedMessages(
         *         conversationId,
         *         pinned.items[0].id,
         *         pinned.version
         *     );
         * }
         */
        return async function getFriendPinnedMessages(
            conversationId: string,
            version: number = 0,
        ): Promise<GetFriendPinnedMessagesResponse> {
            const params = {
                conversationId: conversationId,
                version: version,
                imei: ctx.imei,
            };

            const encryptedParams = utils.encodeAES(JSON.stringify(params));
            if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

            const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
                method: "GET",
            });

            return utils.resolve(response, (result) => {
                const rawData = result.data as { data: PinnedMessageItem[]; version: number };

                // Parse params JSON string trong mỗi item
                const items = (rawData.data || []).map((item) => {
                    if (typeof item.params === "string") {
                        try {
                            item.params = JSON.parse(item.params);
                        } catch {
                            // Keep as string if parse fails
                        }
                    }
                    return item;
                });

                return {
                    items: items,
                    version: rawData.version,
                };
            });
        };
    },
);
