import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

import type { StickerDetail } from "../models/index.js";

export type GetStickerCategoryDetailResponse = StickerDetail[];

export const getStickerCategoryDetailFactory = apiFactory<GetStickerCategoryDetailResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.sticker[0]}/api/message/sticker/category/sticker_detail`);

    /**
     * Get sticker category detail
     *
     * @param cateId Sticker category ID
     *
     * @throws {ZaloApiError}
     */
    return async function getStickerCategoryDetail(cateId: number) {
        const params = {
            cid: cateId,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
