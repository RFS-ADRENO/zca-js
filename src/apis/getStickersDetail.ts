import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory, resolveResponse } from "../utils.js";

export type StickerDetail = {
    id: number;
    cateId: number;
    type: number;
    text: string;
    uri: string;
    fkey: number;
    status: number;
    stickerUrl: string;
    stickerSpriteUrl: string;
    stickerWebpUrl: unknown;
    totalFrames: number;
    duration: number;
    effectId: number;
    checksum: string;
    ext: number;
    source: number;
    fss: unknown;
    fssInfo: unknown;
    version: number;
    extInfo: unknown;
};

export type StickerDetailResponse = StickerDetail[];

export const getStickersDetailFactory = apiFactory<StickerDetailResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.sticker}/api/message/sticker/sticker_detail`);

    /**
     * Get stickers detail by sticker IDs
     *
     * @param stickerIds Sticker IDs to search for
     *
     * @throws {ZaloApiError}
     */
    return async function getStickersDetail(stickerIds: number | number[]) {
        if (!stickerIds) throw new ZaloApiError("Missing sticker id");
        if (!Array.isArray(stickerIds)) stickerIds = [stickerIds];
        if (stickerIds.length == 0) throw new ZaloApiError("Missing sticker id");

        const stickers: StickerDetailResponse = [];
        const tasks = stickerIds.map((stickerId) => getStickerDetail(stickerId));
        const tasksResult = await Promise.allSettled(tasks);
        tasksResult.forEach((result) => {
            if (result.status === "fulfilled") stickers.push(result.value);
        });

        return stickers;
    };

    async function getStickerDetail(stickerId: number) {
        const params = {
            sid: stickerId,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt message");

        const response = await utils.request(
            utils.makeURL(serviceURL, {
                params: encryptedParams,
            }),
        );

        return resolveResponse<StickerDetail>(ctx, response);
    }
});
