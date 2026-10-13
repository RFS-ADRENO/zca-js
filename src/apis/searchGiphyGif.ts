import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

import type { GifMedia } from "../models/index.js";

export type SearchGiphyGifResponse = {
    data_list: {
        id: string;
        original: GifMedia;
        normal: GifMedia;
        hd: GifMedia;
        preview: GifMedia;
    }[];
    has_more: number;
};

export const searchGiphyGifFactory = apiFactory<SearchGiphyGifResponse>()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.sticker[0]}/api/message/giphy/search`);

    /**
     * Search giphy gifs
     *
     * @param keyword The keyword to search for
     * @param offset The offset of the gifs to search
     * @param limit The limit of the gifs to search (I don't see any change when limit)
     *
     * @throws {ZaloApiError}
     */
    return async function searchGiphyGifs(keyword: string, offset: number = 0, limit: number = 10) {
        const params = {
            keyword: keyword,
            offset: offset,
            limit: limit,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
