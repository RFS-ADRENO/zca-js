import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetGiphyCategoriesResponse = {
    data_list: {
        id: number;
        name: string;
        enName: string;
        icon: string;
        type: number;
        keywords: string[];
    }[];
    has_more: number;
};

export const getGiphyCategoriesFactory = apiFactory<GetGiphyCategoriesResponse>()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.sticker[0]}/api/message/giphy/cates`);

    /**
     * Get giphy categories
     * 
     * @param offset The offset of the categories to get
     * @param limit The limit of the categories to get (I don't see any change when limit)
     *
     * @throws {ZaloApiError}
     */
    return async function getGiphyCategories(offset: number = 0, limit: number = 10) {
        const params = {
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
