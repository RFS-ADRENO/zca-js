import { appContext } from "../context.js";
import { decodeAES, encodeAES, makeURL, updateCookie } from "../utils.js";

interface StickerBasic {
    type: number;
    cate_id: number;
    sticker_id: number;
}

interface StickerSuggestions {
    sugg_sticker: StickerBasic[] | null;
    sugg_guggy: StickerBasic[] | null;
    sugg_gif: StickerBasic[] | null;
}

export interface Sticker {
    id: number;
    cateId: number;
    type: number;
    stickerUrl: string;
    stickerSpriteUrl: string;
    stickerWebpUrl: string | null;
}

export function getStickersFactory(serviceURL: string) {
    return async function getStikcers(keyword: string) {
        if (!appContext.secretKey) throw new Error("Secret key is not available");
        if (!appContext.imei) throw new Error("IMEI is not available");
        if (!appContext.cookie) throw new Error("Cookie is not available");
        if (!appContext.userAgent) throw new Error("User agent is not available");

        if (!keyword) throw new Error("Missing keyword");

        const params = {
            keyword: keyword,
            gif: 1,
            guggy: 0,
            imei: appContext.imei,
        };

        const encryptedParams = encodeAES(appContext.secretKey, JSON.stringify(params));
        if (!encryptedParams) throw new Error("Failed to encrypt message");

        const finalServiceUrl = new URL(serviceURL);
        finalServiceUrl.pathname = finalServiceUrl.pathname + "/suggest/stickers";

        const response = await fetch(
            makeURL(finalServiceUrl.toString(), {
                params: encryptedParams,
            }),
            {
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Accept-Encoding": "gzip, deflate, br, zstd",
                    "Accept-Language": "en-US,en;q=0.9",
                    "Content-Type": "application/x-www-form-urlencoded",
                    Cookie: appContext.cookie,
                    Origin: "https://chat.zalo.me",
                    Referer: "https://chat.zalo.me/",
                    "User-Agent": appContext.userAgent,
                },
            }
        );

        if (!response.ok) throw new Error("Failed to get stickers: " + response.statusText);
        if (response.headers.has("set-cookie")) {
            const newCookie = updateCookie(appContext.cookie, response.headers.get("set-cookie")!);
            if (newCookie) appContext.cookie = newCookie;
        }

        const rawSuggestions = decodeAES(appContext.secretKey, (await response.json()).data);
        if (!rawSuggestions) throw new Error("Failed to decrypt message");

        const suggestions: StickerSuggestions = JSON.parse(rawSuggestions).data;
        const pms: Promise<Sticker>[] = [];

        if (suggestions.sugg_sticker)
            suggestions.sugg_sticker.forEach((sticker) =>
                pms.push(getStickerDetail(sticker.sticker_id))
            );
        // @TODO: Implement these
        // if (suggestions.sugg_guggy) suggestions.sugg_guggy.forEach((sticker) => pms.push(getStickerDetail(sticker)));
        // if (suggestions.sugg_gif) suggestions.sugg_gif.forEach((sticker) => pms.push(getStickerDetail(sticker)));

        const stickerDetails = await Promise.all(pms);
        return {
            keyword: keyword,
            suggestions: {
                sticker: stickerDetails,
                // guggy: suggestions.sugg_guggy,
                // gif: suggestions.sugg_gif,
            }
        }
    };

    async function getStickerDetail(stickerId: number): Promise<Sticker> {
        const params = {
            sid: stickerId,
        };

        const encryptedParams = encodeAES(appContext.secretKey!, JSON.stringify(params));
        if (!encryptedParams) throw new Error("Failed to encrypt message");

        const finalServiceUrl = new URL(serviceURL);
        finalServiceUrl.pathname = finalServiceUrl.pathname + "/sticker_detail";

        const response = await fetch(
            makeURL(finalServiceUrl.toString(), {
                params: encryptedParams,
            }),
            {
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Accept-Encoding": "gzip, deflate, br, zstd",
                    "Accept-Language": "en-US,en;q=0.9",
                    "Content-Type": "application/x-www-form-urlencoded",
                    Cookie: appContext.cookie!,
                    Origin: "https://chat.zalo.me",
                    Referer: "https://chat.zalo.me/",
                    "User-Agent": appContext.userAgent!,
                },
            }
        );

        if (!response.ok) throw new Error("Failed to get sticker detail: " + response.statusText);
        if (response.headers.has("set-cookie")) {
            const newCookie = updateCookie(appContext.cookie!, response.headers.get("set-cookie")!);
            if (newCookie) appContext.cookie = newCookie;
        }

        const rawDetail = decodeAES(appContext.secretKey!, (await response.json()).data);
        if (!rawDetail) throw new Error("Failed to decrypt message");

        return JSON.parse(rawDetail).data as Sticker;
    }
}
