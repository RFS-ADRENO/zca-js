import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

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

export const getUserInfoFactory = apiFactory<UserInfoResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/friend/getprofiles/v2`);

    /**
     * Get user info using user id
     *
     * @param userId user id
     *
     * @throws ZaloApiError
     */
    return async function getUserInfo(userId: string | string[]) {
        if (!userId) throw new ZaloApiError("Missing user id");

        if (!Array.isArray(userId)) userId = [userId];

        userId = userId.map((id) => {
            if (id.split("_").length > 1) {
                return id;
            }
            return `${id}_0`;
        });

        const params = {
            phonebook_version: ctx.extraVer!.phonebook,
            friend_pversion_map: userId,
            avatar_size: 120,
            language: ctx.language,
            show_online_status: 1,
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
