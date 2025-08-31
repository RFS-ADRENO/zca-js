import type { Gender, ZBusinessPackage } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type FetchAccountInfoResponse = {
    userId: string;
    username: string;
    displayName: string;
    zaloName: string;
    avatar: string;
    bgavatar: string;
    cover: string;
    gender: Gender;
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
    oaInfo: unknown;
    user_mode: number;
    globalId: string;
    bizPkg: ZBusinessPackage;
    createdTs: number;
    oa_status: unknown;
};

export const fetchAccountInfoFactory = apiFactory<FetchAccountInfoResponse>()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/profile/me-v2`);

    return async function fetchAccountInfo() {
        const response = await utils.request(serviceURL, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
