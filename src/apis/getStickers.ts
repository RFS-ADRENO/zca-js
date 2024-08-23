import { appContext } from "../context.js";
import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { encodeAES, handleZaloResponse, makeURL, request } from "../utils.js";

interface StickerBasic {
    type: number;
    cate_id: number;
    sticker_id: number;
}

interface StickerSuggestions {
    sugg_sticker: StickerBasic[] | null;
    sugg_guggy: StickerBasic[] | null;
    sugg_gif: StickerBasic[] | null;
}

export function getStickersFactory(serviceURL: string) {
    /**
     * Get stickers by keyword
     *
     * @param keyword Keyword to search for
     * @returns Sticker IDs
     *
     * @throws ZaloApiError
     */
    return async function getStickers(keyword: string) {
        if (!appContext.secretKey) throw new ZaloApiError("Secret key is not available");
        if (!appContext.imei) throw new ZaloApiError("IMEI is not available");
        if (!appContext.cookie) throw new ZaloApiError("Cookie is not available");
        if (!appContext.userAgent) throw new ZaloApiError("User agent is not available");

        if (!keyword) throw new ZaloApiError("Missing keyword");

        const params = {
            keyword: keyword,
            gif: 1,
            guggy: 0,
            imei: appContext.imei,
        };

        const encryptedParams = encodeAES(appContext.secretKey, JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt message");

        const finalServiceUrl = new URL(serviceURL);
        finalServiceUrl.pathname = finalServiceUrl.pathname + "/suggest/stickers";

        const response = await request(
            makeURL(finalServiceUrl.toString(), {
                params: encryptedParams,
            }),
        );

        const result = await handleZaloResponse<StickerSuggestions>(response);
        if (result.error) throw new ZaloApiError(result.error.message, result.error.code);

        const suggestions = result.data as StickerSuggestions;
        const stickerIds: number[] = [];

        // @TODO: Implement these
        // suggestions.sugg_guggy, suggestions.sugg_gif
        if (suggestions.sugg_sticker)
            suggestions.sugg_sticker.forEach((sticker) => stickerIds.push(sticker.sticker_id));

        return stickerIds;
    };
}
