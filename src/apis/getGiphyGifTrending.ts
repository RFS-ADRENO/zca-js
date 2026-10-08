import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

import type { GifMedia } from "../models/index.js";

export type GetGiphyGifTrendingResponse = {
    data_list: {
        id: string;
        original: GifMedia;
        normal: GifMedia;
        hd: GifMedia;
        preview: GifMedia;
    }[];
    has_more: number;
};

export const getGiphyGifTrendingFactory = apiFactory<GetGiphyGifTrendingResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.sticker[0]}/api/message/giphy/trending`);

    /**
     * Get giphy trending gifs
     *
     * @param offset The offset of the gifs to get
     * @param limit The limit of the gifs to get (I don't see any change when limit)
     *
     * @throws {ZaloApiError}
     */
    return async function getGiphyGifTrending(offset: number = 0, limit: number = 10) {
        const params = {
            offset: offset,
            limit: limit,
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
