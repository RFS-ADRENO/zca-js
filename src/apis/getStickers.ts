import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

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

export const getStickersFactory = apiFactory<number[]>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.sticker}/api/message/sticker`);

    /**
     * Get stickers by keyword
     *
     * @param keyword Keyword to search for
     * @returns Sticker IDs
     *
     * @throws {ZaloApiError}
     */
    return async function getStickers(keyword: string) {
        if (!keyword) throw new ZaloApiError("Missing keyword");

        const params = {
            keyword: keyword,
            gif: 1,
            guggy: 0,
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt message");

        const finalServiceUrl = new URL(serviceURL);
        finalServiceUrl.pathname = finalServiceUrl.pathname + "/suggest/stickers";

        const response = await utils.request(
            utils.makeURL(finalServiceUrl.toString(), {
                params: encryptedParams,
            }),
        );

        return utils.resolve(response, (result) => {
            const suggestions = result.data as StickerSuggestions;
            const stickerIds: number[] = [];

            // @TODO: Implement these
            // suggestions.sugg_guggy, suggestions.sugg_gif
            if (suggestions.sugg_sticker)
                suggestions.sugg_sticker.forEach((sticker) => stickerIds.push(sticker.sticker_id));

            return stickerIds;
        });
    };
});
