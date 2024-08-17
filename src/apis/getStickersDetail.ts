import { appContext } from "../context.js";
import { decodeAES, encodeAES, makeURL, request } from "../utils.js";

export interface Sticker {
    id: number;
    cateId: number;
    type: number;
    stickerUrl: string;
    stickerSpriteUrl: string;
    stickerWebpUrl: string | null;
}

export function getStickersDetailFactory(serviceURL: string) {
    /**
     * Get stickers by keyword
     *
     * @param keyword Keyword to search for
     */
    return async function getStickersDetail(stickerIds: number | number[]) {
        if (!appContext.secretKey) throw new Error("Secret key is not available");
        if (!appContext.imei) throw new Error("IMEI is not available");
        if (!appContext.cookie) throw new Error("Cookie is not available");
        if (!appContext.userAgent) throw new Error("User agent is not available");

        if (!stickerIds) throw new Error("Missing sticker id");
        if (!Array.isArray(stickerIds)) stickerIds = [stickerIds];
        if (stickerIds.length == 0) throw new Error("Missing sticker id");

        const stickers: Sticker[] = [];
        const tasks = stickerIds.map((stickerId) => getStickerDetail(stickerId));
        const tasksResult = await Promise.allSettled(tasks);
        tasksResult.forEach((result) => {
            if (result.status === "fulfilled") stickers.push(result.value);
        });

        return stickers;
    };

    async function getStickerDetail(stickerId: number): Promise<Sticker> {
        const params = {
            sid: stickerId,
        };

        const encryptedParams = encodeAES(appContext.secretKey!, JSON.stringify(params));
        if (!encryptedParams) throw new Error("Failed to encrypt message");

        const finalServiceUrl = new URL(serviceURL);
        finalServiceUrl.pathname = finalServiceUrl.pathname + "/sticker_detail";

        const response = await request(
            makeURL(finalServiceUrl.toString(), {
                params: encryptedParams,
            }),
        );

        if (!response.ok) throw new Error("Failed to get sticker detail: " + response.statusText);

        const rawDetail = decodeAES(appContext.secretKey!, (await response.json()).data);
        if (!rawDetail) throw new Error("Failed to decrypt message");

        return JSON.parse(rawDetail).data as Sticker;
    }
}
