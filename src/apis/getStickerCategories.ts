import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetStickerCategoryiesResponse = {
    dataUrl: string;
    cs: string;
    exCateIds: number[];
    data: unknown[];
};

export const getStickerCategoriesFactory = apiFactory<GetStickerCategoryiesResponse>()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.sticker[0]}/api/message/sticker/category/list/v2`);

    /**
     * Get sticker categories
     *
     * @throws {ZaloApiError}
     */
    return async function getStickerCategories() {
        const params = {};

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
