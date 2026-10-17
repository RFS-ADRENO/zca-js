import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/index.js";
import { apiFactory, removeUndefinedKeys } from "../utils.js";

export type SendCustomStickerOptions = {
    /** Public URL of the static image used as the original, thumbnail, and HD image. */
    staticImgUrl: string;
    /** Public URL of the WebP image used by Zalo's sticker-like message renderer. */
    animationImgUrl: string;
    width: number;
    height: number;
    /** Optional serialized reference-message payload, matching Zalo's refMessage field. */
    reply?: string;
    /** Message TTL in seconds. Defaults to 0. */
    ttl?: number;
};

export type SendCustomStickerResponse = {
    msgId: number;
};

export const sendCustomStickerFactory = apiFactory<SendCustomStickerResponse>()((api, ctx, utils) => {
    const serviceURL = {
        [ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.file[0]}/api/message/photo_url`, {
            zpw_ver: "645",
            zpw_type: "30",
            nretry: "0",
        }),
        [ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.file[0]}/api/group/photo_url`, {
            zpw_ver: "645",
            zpw_type: "30",
            nretry: "0",
        }),
    };

    /**
     * Send a custom sticker-style image message using public image URLs.
     *
     * This uses an undocumented Zalo endpoint and is not the same as registering
     * a sticker in Zalo's sticker catalog. Endpoint compatibility may change.
     */
    return async function sendCustomSticker(
        options: SendCustomStickerOptions,
        threadId: string,
        type: ThreadType = ThreadType.User,
    ) {
        if (!options?.staticImgUrl || !options?.animationImgUrl) {
            throw new ZaloApiError("Missing custom sticker image URL");
        }
        if (!threadId) throw new ZaloApiError("Missing threadId");
        if (type !== ThreadType.User && type !== ThreadType.Group) {
            throw new ZaloApiError("Thread type is invalid");
        }
        if (!Number.isFinite(options.width) || options.width <= 0) {
            throw new ZaloApiError("Invalid sticker width");
        }
        if (!Number.isFinite(options.height) || options.height <= 0) {
            throw new ZaloApiError("Invalid sticker height");
        }

        const isGroupMessage = type === ThreadType.Group;
        const params: Record<string, unknown> = {
            clientId: Date.now(),
            title: "",
            oriUrl: options.staticImgUrl,
            thumbUrl: options.staticImgUrl,
            hdUrl: options.staticImgUrl,
            width: options.width,
            height: options.height,
            properties: JSON.stringify({
                subType: 0,
                color: -1,
                size: -1,
                type: 3,
                ext: JSON.stringify({ sSrcStr: "@STICKER", sSrcType: 0 }),
            }),
            contentId: Date.now(),
            thumb_height: options.height,
            thumb_width: options.width,
            webp: JSON.stringify({
                width: options.width,
                height: options.height,
                url: options.animationImgUrl,
            }),
            zsource: -1,
            ttl: options.ttl ?? 0,
            refMessage: options.reply,
            toId: isGroupMessage ? undefined : threadId,
            visibility: isGroupMessage ? 0 : undefined,
            grid: isGroupMessage ? threadId : undefined,
        };

        removeUndefinedKeys(params);

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt custom sticker params");

        const response = await utils.request(serviceURL[type], {
            method: "POST",
            body: new URLSearchParams({ params: encryptedParams }),
        });

        return utils.resolve(response);
    };
});
