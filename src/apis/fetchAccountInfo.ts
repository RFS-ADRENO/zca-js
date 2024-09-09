import { Zalo } from "../zalo.js";
import { appContext } from "../context.js";
import { encodeAES, request } from "../utils.js";

export function fetchAccountInfoFactory(serviceURL: string) {
    return async function fetchAccountInfo() {
        if (!appContext.secretKey) throw new Error("Secret key is not available");
        if (!appContext.imei) throw new Error("IMEI is not available");
        if (!appContext.cookie) throw new Error("Cookie is not available");
        if (!appContext.userAgent) throw new Error("User agent is not available");

        const params: any = {
            params: {
                avatar_size: 120,
                imei: appContext.imei
            },
            zpw_ver: Zalo.API_VERSION,
            zpw_type: Zalo.API_TYPE,
            os: 8,
            browser: 0
        };

        const encryptedParams = encodeAES(appContext.secretKey, JSON.stringify(params));
        if (!encryptedParams) throw new Error("Failed to encrypt params");

        const response = await request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        if (!response.ok) throw new Error("Failed fetch account info: " + response.statusText);

        return (await response.json()).data;
    }
}