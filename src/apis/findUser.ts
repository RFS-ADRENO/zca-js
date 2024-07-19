import { appContext } from "../context.js";
import { decodeAES, encodeAES, makeURL, updateCookie } from "../utils.js";

export interface User {
    avatar: string;
    cover: string;
    status: string;
    gender: number;
    dob: number;
    sdob: string;
    globalId: string;
    uid: string;
    zalo_name: string;
    display_name: string;
}

export function findUserFactory(serviceURL: string) {
    return async function findUser(phoneNumber: string) {
        if (!appContext.secretKey) throw new Error("Secret key is not available");
        if (!appContext.imei) throw new Error("IMEI is not available");
        if (!appContext.cookie) throw new Error("Cookie is not available");
        if (!appContext.userAgent) throw new Error("User agent is not available");

        if (!phoneNumber) throw new Error("Missing phoneNumber");
        if (phoneNumber.startsWith("0")) {
            if (appContext.language == "vi") phoneNumber = "84" + phoneNumber.slice(1);
        }

        const params = {
            phone: phoneNumber,
            avatar_size: 240,
            language: appContext.language,
            imei: appContext.imei,
            reqSrc: 40
        };

        const encryptedParams = encodeAES(appContext.secretKey, JSON.stringify(params));
        if (!encryptedParams) throw new Error("Failed to encrypt message");

        const finalServiceUrl = new URL(serviceURL);
        finalServiceUrl.searchParams.append("params", encryptedParams);

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

        if (!response.ok) throw new Error("Failed to find user: " + response.statusText);
        if (response.headers.has("set-cookie")) {
            const newCookie = updateCookie(appContext.cookie, response.headers.get("set-cookie")!);
            if (newCookie) appContext.cookie = newCookie;
        }

        const rawUserData = decodeAES(appContext.secretKey, (await response.json()).data);
        if (!rawUserData) throw new Error("Failed to decrypt message");

        return JSON.parse(rawUserData).data as User;
    }
}
