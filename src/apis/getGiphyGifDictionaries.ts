import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetGiphyGifDictionariesResponse = {
    data_list: {
        id: string;
        enKeywords: string[];
        viKeywords: string[];
    }[];
    has_more: number;
};

export const getGiphyGifDictionariesFactory = apiFactory<GetGiphyGifDictionariesResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.sticker[0]}/api/message/giphy/dicts`);

    /**
     * Get giphy gif dictionaries
     *
     * @param offset The offset of the dictionaries to get
     * @param limit The limit of the dictionaries to get (I don't see any change when limit)
     *
     * @throws {ZaloApiError}
     */
    return async function getGiphyGifDictionaries(offset: number = 0, limit: number = 10) {
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
