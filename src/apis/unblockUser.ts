import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { appContext } from "../context.js";
import { encodeAES, handleZaloResponse, request } from "../utils.js";

export type UnBlockUserResponse = "";

export function unblockUserFactory(serviceURL: string) {
    return async function unblockUser(userId: string) {
        if (!appContext.secretKey) throw new ZaloApiError("Secret key is not available");
        if (!appContext.imei) throw new ZaloApiError("IMEI is not available");
        if (!appContext.cookie) throw new ZaloApiError("Cookie is not available");
        if (!appContext.userAgent) throw new ZaloApiError("User agent is not available");
        if (!appContext.language) throw new ZaloApiError("Language is not available");

        const params: any = {
            fid: userId,
			imei: appContext.imei,
        };

        const encryptedParams = encodeAES(appContext.secretKey, JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        const result = await handleZaloResponse<UnBlockUserResponse>(response);
        if (result.error) throw new ZaloApiError(result.error.message, result.error.code);

        return result.data as UnBlockUserResponse;
    };
}
