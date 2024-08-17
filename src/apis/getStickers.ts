import { appContext } from "../context.js";
import { decodeAES, encodeAES, makeURL, request } from "../utils.js";

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

export interface Sticker {
    id: number;
    cateId: number;
    type: number;
    stickerUrl: string;
    stickerSpriteUrl: string;
    stickerWebpUrl: string | null;
}

export function getStickersFactory(serviceURL: string) {
    /**
     * Get stickers by keyword
     *
     * @param keyword Keyword to search for
     * @returns Sticker IDs
     */
    return async function getStickers(keyword: string) {
        if (!appContext.secretKey) throw new Error("Secret key is not available");
        if (!appContext.imei) throw new Error("IMEI is not available");
        if (!appContext.cookie) throw new Error("Cookie is not available");
        if (!appContext.userAgent) throw new Error("User agent is not available");

        if (!keyword) throw new Error("Missing keyword");

        const params = {
            keyword: keyword,
            gif: 1,
            guggy: 0,
            imei: appContext.imei,
        };

        const encryptedParams = encodeAES(appContext.secretKey, JSON.stringify(params));
        if (!encryptedParams) throw new Error("Failed to encrypt message");

        const finalServiceUrl = new URL(serviceURL);
        finalServiceUrl.pathname = finalServiceUrl.pathname + "/suggest/stickers";

        const response = await request(
            makeURL(finalServiceUrl.toString(), {
                params: encryptedParams,
            }),
        );

        if (!response.ok) throw new Error("Failed to get stickers: " + response.statusText);

        const rawSuggestions = decodeAES(appContext.secretKey, (await response.json()).data);
        if (!rawSuggestions) throw new Error("Failed to decrypt message");

        const suggestions: StickerSuggestions = JSON.parse(rawSuggestions).data;
        const stickerIds: number[] = [];

        // @TODO: Implement these
        // suggestions.sugg_guggy, suggestions.sugg_gif
        if (suggestions.sugg_sticker)
            suggestions.sugg_sticker.forEach((sticker) => stickerIds.push(sticker.sticker_id));

        return stickerIds;
    };
}
