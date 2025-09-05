import type { Gender } from "./Enum.js";
import type { ZBusinessPackage } from "./ZBusiness.js";

export type User = {
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

export type DetailUser = {
    id: string;
    dName: string;
    zaloName: string;
    avatar: string;
    avatar_25: string;
    accountStatus: number;
    type: number;
};

export type DetailMemberProfile = {
    displayName: string;
    zaloName: string;
    avatar: string;
    accountStatus: number;
    type: number;
    lastUpdateTime: number;
    globalId: string;
    id: string;
};
