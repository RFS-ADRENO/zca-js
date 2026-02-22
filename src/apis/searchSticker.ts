import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

import type { StickerBasic } from "../models/index.js";

export type SearchStickerResponse = StickerBasic[];

export const searchStickerFactory = apiFactory<SearchStickerResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.sticker[0]}/api/message/sticker/search`);

    /**
     * Search stickers
     *
     * @param keyword Keyword to search stickers
     * @param limit Limit of stickers to return (default: 50)
     *
     * @throws {ZaloApiError}
     */
    return async function searchSticker(keyword: string, limit: number = 50) {
        const params = {
            keyword: keyword,
            limit: limit,
            srcType: 0,
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
