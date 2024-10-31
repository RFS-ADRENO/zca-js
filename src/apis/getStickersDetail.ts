import { appContext } from "../context.js";
import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory, encodeAES, makeURL, request, resolveResponse } from "../utils.js";

export interface StickerDetailResponse {
    id: number;
    cateId: number;
    type: number;
    stickerUrl: string;
    stickerSpriteUrl: string;
    stickerWebpUrl: string | null;
}

export const getStickersDetailFactory = apiFactory()((api) => {
    const serviceURL = makeURL(`${api.zpwServiceMap.sticker}/api/message/sticker`);

    /**
     * Get stickers by keyword
     *
     * @param keyword Keyword to search for
     */
    return async function getStickersDetail(stickerIds: number | number[]) {
        if (!stickerIds) throw new ZaloApiError("Missing sticker id");
        if (!Array.isArray(stickerIds)) stickerIds = [stickerIds];
        if (stickerIds.length == 0) throw new ZaloApiError("Missing sticker id");

        const stickers: StickerDetailResponse[] = [];
        const tasks = stickerIds.map((stickerId) => getStickerDetail(stickerId));
        const tasksResult = await Promise.allSettled(tasks);
        tasksResult.forEach((result) => {
            if (result.status === "fulfilled") stickers.push(result.value);
        });

        return stickers;
    };

    async function getStickerDetail(stickerId: number): Promise<StickerDetailResponse> {
        const params = {
            sid: stickerId,
        };

        const encryptedParams = encodeAES(appContext.secretKey!, JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt message");

        const finalServiceUrl = new URL(serviceURL);
        finalServiceUrl.pathname = finalServiceUrl.pathname + "/sticker_detail";

        const response = await request(
            makeURL(finalServiceUrl.toString(), {
                params: encryptedParams,
            }),
        );

        return resolveResponse<StickerDetailResponse>(response);
    }
});
