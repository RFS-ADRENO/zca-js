import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils/index.js";

import type { StickerBasic } from "../../models/index.js";

export type GetSearchStickerResponse = StickerBasic[];

export const getSearchStickerFactory = apiFactory<GetSearchStickerResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.sticker[0]}/api/message/sticker/search`);

    /**
     * Get search sticker
     *
     * @param keyword Keyword to search sticker
     * @param limit Limit of stickers to return (default: 50)
     *
     * @throws {ZaloApiError}
     */
    return async function getSearchSticker(keyword: string, limit: number = 50) {
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
