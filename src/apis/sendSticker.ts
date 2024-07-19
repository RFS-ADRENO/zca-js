import { appContext } from "../context.js";
import { decodeAES, encodeAES, updateCookie } from "../utils.js";
import { Sticker } from "./getStickers.js";

export function sendStickerFactory(serviceURL: string) {
    return async function sendSticker(sticker: Sticker, recipientId: string) {
        if (!appContext.secretKey) throw new Error("Secret key is not available");
        if (!appContext.imei) throw new Error("IMEI is not available");
        if (!appContext.cookie) throw new Error("Cookie is not available");
        if (!appContext.userAgent) throw new Error("User agent is not available");

        if (!sticker) throw new Error("Missing sticker");
        if (!recipientId) throw new Error("Missing recipientId");

        if (!sticker.id) throw new Error("Missing sticker id");
        if (!sticker.cateId) throw new Error("Missing sticker cateId");
        if (!sticker.type) throw new Error("Missing sticker type");

        const params = {
            stickerId: sticker.id,
            cateId: sticker.cateId,
            type: sticker.type,
            clientId: Date.now(),
            imei: appContext.imei,
            zsource: 101,
            toid: recipientId,
        }

        const encryptedParams = encodeAES(appContext.secretKey, JSON.stringify(params));
        if (!encryptedParams) throw new Error("Failed to encrypt message");

        const finalServiceUrl = new URL(serviceURL);
        finalServiceUrl.searchParams.append("nretry", "0");

        const response = await fetch(finalServiceUrl.toString(), {
            method: "POST",
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
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        if (!response.ok) throw new Error("Failed to send message: " + response.statusText);
        if (response.headers.has("set-cookie")) {
            const newCookie = updateCookie(appContext.cookie, response.headers.get("set-cookie")!);
            if (newCookie) appContext.cookie = newCookie;
        }


        return decodeAES(appContext.secretKey, (await response.json()).data);
    };
}
