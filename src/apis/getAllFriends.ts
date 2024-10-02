import { Zalo } from "../zalo.js";
import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { appContext } from "../context.js";
import { encodeAES, handleZaloResponse, request } from "../utils.js";

export type GetAllFriendsResponse = {
    userId: string;
    name?: string;
    avatarUrl?: string;
    email?: string;
    phoneNumber?: string;
    gender?: number;
    birthday?: string;
    lastOnline?: number;
    status?: string;
};

export function getAllFriendsFactory(serviceURL: string) {
    return async function getAllFriends() {
        if (!appContext.secretKey) throw new ZaloApiError("Secret key is not available");
        if (!appContext.imei) throw new ZaloApiError("IMEI is not available");
        if (!appContext.cookie) throw new ZaloApiError("Cookie is not available");
        if (!appContext.userAgent) throw new ZaloApiError("User agent is not available");

        const params: any = {
            params: {
                incInvalid: 0,
                page: 1,
                count: 20000,
                avatar_size: 120,
                actiontime: 0,
            },
            zpw_ver: Zalo.API_VERSION,
            zpw_type: Zalo.API_TYPE,
        };

        const encryptedParams = encodeAES(appContext.secretKey, JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        const result = await handleZaloResponse<GetAllFriendsResponse>(response);
        if (result.error) throw new ZaloApiError(result.error.message, result.error.code);

        return result.data as GetAllFriendsResponse;
    };
}
