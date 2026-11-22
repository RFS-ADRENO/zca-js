import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

import type { StickerCategoryInfo } from "../models/index.js";

export type GetStickerCategoryInfoResponse = StickerCategoryInfo;

export const getStickerCategoryInfoFactory = apiFactory<GetStickerCategoryInfoResponse>()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.sticker[0]}/api/message/sticker/category/detail`);

    /**
     * Get sticker category info
     *
     * @param categoryId Category ID
     *
     * @throws {ZaloApiError}
     */
    return async function getStickerCategoryInfo(categoryId: number) {
        const params = {
            cid: categoryId,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
