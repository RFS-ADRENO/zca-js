import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetStickerSuggestedKeywordsResponse = {
    keywords: string[];
    expired_time: number;
    word_search: number;
};

export const getStickerSuggestedKeywordsFactory = apiFactory<GetStickerSuggestedKeywordsResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.sticker[0]}/api/message/sticker/suggest/keywords`);

    /**
     * Get sticker suggested keywords
     *
     * @throws {ZaloApiError}
     */
    return async function getStickerSuggestedKeywords() {
        const params = {
            imei: ctx.imei
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
