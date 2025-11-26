import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetStickerCategoryDetailResponse = {
    id: number;
    cateId: number;
    type: number;
    text: string;
    uri: string;
    fkey: number;
    status: number;
    stickerUrl: string;
    stickerSpriteUrl: string;
    stickerWebpUrl: string | null;
    totalFrames: number;
    duration: number;
    effectId: number;
    checksum: string;
    ext: number;
    source: number;
    fss: null;
    fssInfo: null;
    version: number;
    extInfo: null;
}[];

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
