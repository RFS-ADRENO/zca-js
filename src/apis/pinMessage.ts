import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

/**
 * Các loại tin nhắn có thể ghim
 */
export enum PinMessageType {
    /** Tin nhắn văn bản */
    Text = 1,
    /** Tin nhắn thoại */
    Voice = 31,
    /** Hình ảnh */
    Photo = 32,
    /** Sticker */
    Sticker = 36,
    /** Hình vẽ (doodle) */
    Doodle = 37,
    /** Link/Danh thiếp */
    Link = 38,
    /** Vị trí */
    Location = 43,
    /** Video */
    Video = 44,
    /** File/Thư mục */
    File = 46,
    /** GIF */
    Gif = 49,
    /** Thẻ ngân hàng */
    BankCard = 52,
}

/**
 * Emoji mặc định cho từng loại tin nhắn
 */
export const PinMessageEmoji: Record<PinMessageType, string> = {
    [PinMessageType.Text]: "📌",
    [PinMessageType.Voice]: "📎",
    [PinMessageType.Photo]: "🌄",
    [PinMessageType.Sticker]: "📎",
    [PinMessageType.Doodle]: "🌄",
    [PinMessageType.Link]: "🔗",
    [PinMessageType.Location]: "📍",
    [PinMessageType.Video]: "🎥",
    [PinMessageType.File]: "📎",
    [PinMessageType.Gif]: "🌄",
    [PinMessageType.BankCard]: "📎",
};

/**
 * Màu mặc định cho ghim tin nhắn
 */
export const PIN_DEFAULT_COLOR = -14540254;

/**
 * Thông tin cơ bản của tin nhắn cần ghim
 */
export type PinMessageInfo = {
    /** Client message ID */
    clientMsgId: string;
    /** Global message ID */
    globalMsgId: string;
    /** UID của người gửi tin nhắn */
    senderUid: string;
    /** Tên người gửi (có thể để trống) */
    senderName?: string;
};

/**
 * Options cho tin nhắn văn bản
 */
export type PinTextMessageOptions = PinMessageInfo & {
    type: PinMessageType.Text;
    /** Nội dung tin nhắn */
    title: string;
};

/**
 * Options cho tin nhắn có hình ảnh/thumbnail
 */
export type PinMediaMessageOptions = PinMessageInfo & {
    type: PinMessageType.Photo | PinMessageType.Doodle | PinMessageType.Video | PinMessageType.Gif;
    /** URL thumbnail */
    thumb: string;
    /** Tiêu đề (tùy chọn) */
    title?: string;
};

/**
 * Options cho tin nhắn thoại
 */
export type PinVoiceMessageOptions = PinMessageInfo & {
    type: PinMessageType.Voice;
};

/**
 * Options cho sticker
 */
export type PinStickerMessageOptions = PinMessageInfo & {
    type: PinMessageType.Sticker;
    /** Thông tin sticker */
    sticker: {
        type: string;
        catId: number;
        id: number;
        childNumber?: number;
    };
};

/**
 * Options cho vị trí
 */
export type PinLocationMessageOptions = PinMessageInfo & {
    type: PinMessageType.Location;
    /** Tiêu đề vị trí (tọa độ hoặc địa chỉ) */
    title: string;
};

/**
 * Options cho file
 */
export type PinFileMessageOptions = PinMessageInfo & {
    type: PinMessageType.File;
    /** Tên file */
    title: string;
    /** Thông tin file bổ sung */
    fileInfo?: {
        tWidth?: number;
        tHeight?: number;
        checksum?: string;
        checksumSha?: string;
        fileExt?: string;
        fileSize?: number;
        /** 1: file thường, 2: thư mục */
        fType?: number;
        fdata?: string;
    };
};

/**
 * Options cho link/danh thiếp
 */
export type PinLinkMessageOptions = PinMessageInfo & {
    type: PinMessageType.Link;
    /** URL link */
    href: string;
    /** URL thumbnail */
    thumb?: string;
    /** Tiêu đề */
    title: string;
    /** Caption */
    linkCaption?: string;
    /** Thông tin bổ sung */
    extra?: Record<string, unknown>;
};

/**
 * Options cho thẻ ngân hàng
 */
export type PinBankCardMessageOptions = PinMessageInfo & {
    type: PinMessageType.BankCard;
};

/**
 * Tất cả các loại options
 */
export type PinMessageOptions =
    | PinTextMessageOptions
    | PinMediaMessageOptions
    | PinVoiceMessageOptions
    | PinStickerMessageOptions
    | PinLocationMessageOptions
    | PinFileMessageOptions
    | PinLinkMessageOptions
    | PinBankCardMessageOptions;

/**
 * Options bổ sung khi ghim
 */
export type PinOptions = {
    /** Emoji hiển thị (mặc định tự động theo loại tin nhắn) */
    emoji?: string;
    /** Màu sắc (mặc định: -14540254) */
    color?: number;
};

/**
 * Response khi ghim tin nhắn thành công
 */
export type PinMessageResponse = {
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
    /** Thông tin tin nhắn đã ghim */
    params: Record<string, unknown>;
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

export const pinMessageFactory = apiFactory<PinMessageResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/topic/createv2`);

    /**
     * Ghim tin nhắn trong nhóm
     *
     * @param message Thông tin tin nhắn cần ghim
     * @param groupId ID nhóm
     * @param options Options bổ sung (emoji, color)
     *
     * @throws {ZaloApiError}
     *
     * @example
     * // Ghim tin nhắn văn bản
     * await api.pinMessage({
     *     type: PinMessageType.Text,
     *     clientMsgId: "1769826176610",
     *     globalMsgId: "7485866940707_000",
     *     senderUid: "2126221471227340986",
     *     title: "Nội dung tin nhắn"
     * }, "8330281778886679712");
     *
     * @example
     * // Ghim hình ảnh
     * await api.pinMessage({
     *     type: PinMessageType.Photo,
     *     clientMsgId: "1769911247582",
     *     globalMsgId: "7488908275485_001",
     *     senderUid: "2126221471227340986",
     *     thumb: "https://photo.zdn.vn/..."
     * }, "8330281778886679712");
     *
     * @example
     * // Ghim sticker
     * await api.pinMessage({
     *     type: PinMessageType.Sticker,
     *     clientMsgId: "1769958277323",
     *     globalMsgId: "7490419441362_000",
     *     senderUid: "2126221471227340986",
     *     sticker: { type: "7", catId: 10236, id: 19843, childNumber: -1 }
     * }, "8330281778886679712");
     */
    return async function pinMessage(
        message: PinMessageOptions,
        groupId: string,
        options: PinOptions = {},
    ): Promise<PinMessageResponse> {
        // Build params object based on message type
        const messageParams = buildMessageParams(message);

        const emoji = options.emoji ?? PinMessageEmoji[message.type] ?? "📎";
        const color = options.color ?? PIN_DEFAULT_COLOR;

        const params = {
            grid: groupId,
            type: 2, // type 2 = pin message
            color: color,
            emoji: emoji,
            startTime: -1,
            duration: -1,
            params: JSON.stringify(messageParams),
            repeat: 0,
            src: -1,
            imei: ctx.imei,
            pinAct: 1,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response, (result) => {
            const data = result.data as PinMessageResponse;
            if (typeof data.params === "string") {
                data.params = JSON.parse(data.params);
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
