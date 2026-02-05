import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";
import {
    PinMessageType,
    PinMessageEmoji,
    PIN_DEFAULT_COLOR,
} from "./pinMessage.js";
import type { PinMessageOptions, PinOptions, PinMessageResponse } from "./pinMessage.js";

// Re-export for convenience
export { PinMessageType, PinMessageEmoji, PIN_DEFAULT_COLOR };
export type { PinMessageOptions, PinOptions };

/**
 * Response khi ghim tin nhắn trong hội thoại 1-1
 */
export type PinFriendMessageResponse = {
    /** Thông tin pin */
    data: PinMessageResponse;
    /** Version của board */
    version: number;
};

export const pinFriendMessageFactory = apiFactory<PinFriendMessageResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend_board[0]}/api/friendboard/create`);

    /**
     * Ghim tin nhắn trong hội thoại 1-1 (friend)
     *
     * @param message Thông tin tin nhắn cần ghim
     * @param conversationId ID hội thoại (conversation ID, không phải userId)
     * @param options Options bổ sung (emoji, color)
     * @param version Board version (mặc định 0)
     *
     * @throws {ZaloApiError}
     *
     * @example
     * // Ghim tin nhắn văn bản
     * await api.pinFriendMessage({
     *     type: PinMessageType.Text,
     *     clientMsgId: "1769826176610",
     *     globalMsgId: "7485866940707",
     *     senderUid: "2126221471227340986",
     *     title: "Nội dung tin nhắn"
     * }, "3658014113694025208");
     *
     * @example
     * // Ghim sticker
     * await api.pinFriendMessage({
     *     type: PinMessageType.Sticker,
     *     clientMsgId: "1769497033323",
     *     globalMsgId: "7472757429971",
     *     senderUid: "2126221471227340986",
     *     sticker: { type: "7", catId: 12238, id: 49510, childNumber: -1 }
     * }, "3658014113694025208");
     */
    return async function pinFriendMessage(
        message: PinMessageOptions,
        conversationId: string,
        options: PinOptions = {},
        version: number = 0,
    ): Promise<PinFriendMessageResponse> {
        // Build params object based on message type
        const messageParams = buildMessageParams(message);

        const emoji = options.emoji ?? PinMessageEmoji[message.type] ?? "📎";
        const color = options.color ?? PIN_DEFAULT_COLOR;

        const params = {
            conversationId: conversationId,
            topic: {
                color: color,
                duration: -1,
                emoji: emoji,
                params: JSON.stringify(messageParams),
                repeat: 0,
                startTime: -1,
                type: 2, // type 2 = pin message
                src: -1,
                pinAct: 1,
            },
            version: version,
            lang: "vi",
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response, (result) => {
            const data = result.data as PinFriendMessageResponse;
            if (typeof data.data.params === "string") {
                data.data.params = JSON.parse(data.data.params);
            }
            return data;
        });
    };
});

/**
 * Build params object based on message type
 */
function buildMessageParams(message: PinMessageOptions): Record<string, unknown> {
    const baseParams = {
        client_msg_id: message.clientMsgId,
        global_msg_id: message.globalMsgId,
        senderUid: message.senderUid,
        senderName: message.senderName ?? "",
        msg_type: message.type,
    };

    switch (message.type) {
        case PinMessageType.Text:
            return {
                ...baseParams,
                title: message.title,
            };

        case PinMessageType.Voice:
            return baseParams;

        case PinMessageType.Photo:
        case PinMessageType.Doodle:
        case PinMessageType.Video:
        case PinMessageType.Gif:
            return {
                ...baseParams,
                thumb: message.thumb,
                title: message.title ?? "",
            };

        case PinMessageType.Sticker:
            return {
                ...baseParams,
                extra: JSON.stringify(message.sticker),
            };

        case PinMessageType.Location:
            return {
                ...baseParams,
                title: message.title,
            };

        case PinMessageType.File:
            return {
                ...baseParams,
                title: message.title,
                extra: message.fileInfo ? JSON.stringify(message.fileInfo) : undefined,
            };

        case PinMessageType.Link:
            return {
                ...baseParams,
                href: message.href,
                thumb: message.thumb ?? "",
                title: message.title,
                linkCaption: message.linkCaption ?? message.title,
                extra: message.extra ? JSON.stringify(message.extra) : undefined,
            };

        case PinMessageType.BankCard:
            return {
                ...baseParams,
                extra: JSON.stringify({
                    msg: { en: "[Bank account]", vi: "[Tài khoản ngân hàng]" },
                    highLightsV2: [],
                }),
            };

        default:
            return baseParams;
    }
}
