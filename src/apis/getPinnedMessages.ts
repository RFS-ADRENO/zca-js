import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

/**
 * Thông tin một tin nhắn được ghim
 */
export type PinnedMessageItem = {
    /** ID của pin */
    id: string;
    /** Loại (2 = pin message) */
    type: number;
    /** Màu sắc */
    color: number;
    /** Emoji */
    emoji: string;
    /** Thời gian bắt đầu */
    startTime: number;
    /** Thời lượng */
    duration: number;
    /** Thông tin tin nhắn (đã được parse từ JSON) */
    params: {
        senderUid: string;
        senderName: string;
        client_msg_id: string;
        global_msg_id: string;
        msg_type: number;
        title?: string;
        thumb?: string;
        href?: string;
        extra?: string;
        [key: string]: unknown;
    };
    /** UID người tạo */
    creatorId: string;
    /** UID người chỉnh sửa */
    editorId: string;
    /** Thời gian tạo */
    createTime: number;
    /** Thời gian chỉnh sửa */
    editTime: number;
    /** Lặp lại */
    repeat: number;
};

/**
 * Response khi lấy danh sách tin nhắn ghim đầu hội thoại
 */
export type GetPinnedMessagesResponse = {
    /** Giới hạn số tin nhắn ghim hiển thị (mặc định 3) */
    pinLimit: number;
    /** ID nhóm */
    groupId: string;
    /** Phiên bản board */
    boardVersion: number;
    /** Danh sách tin nhắn được ghim */
    items: PinnedMessageItem[];
};

export const getPinnedMessagesFactory = apiFactory<GetPinnedMessagesResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/pin/list`);

    /**
     * Lấy danh sách tin nhắn được ghim lên đầu hội thoại
     *
     * Lưu ý: API này trả về tối đa 3 tin nhắn ghim được hiển thị
     * ở đầu hội thoại (khác với getListBoard trả về tất cả)
     *
     * @param groupId ID nhóm
     * @param boardVersion Phiên bản board (mặc định 0 để lấy mới nhất)
     *
     * @throws {ZaloApiError}
     *
     * @example
     * // Lấy danh sách tin nhắn ghim đầu hội thoại
     * const result = await api.getPinnedMessages("8330281778886679712");
     * console.log(result.items); // Tối đa 3 tin nhắn
     * console.log(result.pinLimit); // 3
     */
    return async function getPinnedMessages(
        groupId: string,
        boardVersion: number = 0,
    ): Promise<GetPinnedMessagesResponse> {
        const params = {
            groupId: groupId,
            boardVersion: boardVersion,
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const url = serviceURL + "&params=" + encodeURIComponent(encryptedParams);

        const response = await utils.request(url, {
            method: "GET",
        });

        return utils.resolve(response, (result) => {
            const data = result.data as GetPinnedMessagesResponse;

            // Parse params JSON string trong mỗi item
            if (data.items && Array.isArray(data.items)) {
                data.items = data.items.map((item) => {
                    if (typeof item.params === "string") {
                        try {
                            item.params = JSON.parse(item.params);
                        } catch {
                            // Keep as string if parse fails
                        }
                    }
                    return item;
                });
            }

            return data;
        });
    };
});
