import { Zalo } from "../zalo.js";
import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { appContext } from "../context.js";
import { encodeAES, handleZaloResponse, request } from "../utils.js";

export type FetchAccountInfoResponse = {
    userId: string | number;
    name?: string;
    avatarUrl?: string;
    email?: string;
    phoneNumber?: string;
};

export function fetchAccountInfoFactory(serviceURL: string) {
    return async function fetchAccountInfo() {
        if (!appContext.secretKey) throw new ZaloApiError("Secret key is not available");
        if (!appContext.imei) throw new ZaloApiError("IMEI is not available");
        if (!appContext.cookie) throw new ZaloApiError("Cookie is not available");
        if (!appContext.userAgent) throw new ZaloApiError("User agent is not available");

        const params: any = {
            params: {
                avatar_size: 120,
                imei: appContext.imei,
            },
            zpw_ver: Zalo.API_VERSION,
            zpw_type: Zalo.API_TYPE,
            os: 8,
            browser: 0,
        };

        const encryptedParams = encodeAES(appContext.secretKey, JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        const result = await handleZaloResponse<FetchAccountInfoResponse>(response);
        if (result.error) throw new ZaloApiError(result.error.message, result.error.code);

        return result.data as FetchAccountInfoResponse;
    };
}
