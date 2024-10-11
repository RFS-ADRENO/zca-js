import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { handleZaloResponse, request } from "../utils.js";

export type GetAllFriendsResponse = {
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

export function getAllFriendsFactory(serviceURL: string) {
    return async function getAllFriends() {

        const response = await request(serviceURL, {
            method: "GET",
        });

        const result = await handleZaloResponse<GetAllFriendsResponse>(response);
        if (result.error) throw new ZaloApiError(result.error.message, result.error.code);

        return result.data as GetAllFriendsResponse;
    };
}
