import { appContext } from "../context.js";
import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { encodeAES, handleZaloResponse, makeURL, request } from "../utils.js";
import { API, Zalo } from "../zalo.js";

export type ProfileInfo = {
    userId: string;
    username: string;
    displayName: string;
    zaloName: string;
    avatar: string;
    bgavatar: string;
    cover: string;
    gender: number;
    dob: number;
    sdob: string;
    status: string;
    phoneNumber: string;
    isFr: number;
    isBlocked: number;
    lastActionTime: number;
    lastUpdateTime: number;
    isActive: number;
    key: number;
    type: number;
    isActivePC: number;
    isActiveWeb: number;
    isValid: number;
    userKey: string;
    accountStatus: number;
    oaInfo: any;
    user_mode: number;
    globalId: string;
    bizPkg: {
        label: any;
        pkgId: number;
    };
    createdTs: number;
    oa_status: any;
};

export type UserInfoResponse = {
    unchanged_profiles: Record<string, any>;
    phonebook_version: number;
    changed_profiles: Record<string, ProfileInfo>;
};

export function getUserInfoFactory(api: API) {
    const serviceURL = makeURL(`${api.zpwServiceMap.profile[0]}/api/social/friend/getprofiles/v2`, {
        zpw_ver: Zalo.API_VERSION,
        zpw_type: Zalo.API_TYPE,
    });

    /**
     * Get user info using user id
     *
     * @param userId user id
     *
     * @throws ZaloApiError
     */
    return async function getUserInfo(userId: string) {
        if (!appContext.secretKey) throw new ZaloApiError("Secret key is not available");
        if (!appContext.imei) throw new ZaloApiError("IMEI is not available");
        if (!appContext.cookie) throw new ZaloApiError("Cookie is not available");
        if (!appContext.userAgent) throw new ZaloApiError("User agent is not available");

        if (!userId) throw new ZaloApiError("Missing user id");

        const params = {
            phonebook_version: appContext.extraVer!.phonebook,
            friend_pversion_map: [`${userId}_0`],
            avatar_size: 120,
            language: "vi",
            show_online_status: 1,
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

        const result = await handleZaloResponse<UserInfoResponse>(response);
        if (result.error) throw new ZaloApiError(result.error.message, result.error.code);

        return result.data as UserInfoResponse;
    };
}
