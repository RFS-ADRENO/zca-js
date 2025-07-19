import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { Gender } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type GetAllFriendsResponse = {
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
    oaInfo: any;
    user_mode: number;
    globalId: string;
    bizPkg: {
        label: any;
        pkgId: number;
    };
    createdTs: number;
    oa_status: any;
}[];

export const getAllFriendsFactory = apiFactory<GetAllFriendsResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/friend/getfriends`);

    /**
     * Get all friends
     * 
     * @param count Page size (default: 20000)
     * @param page Page number (default: 1)
     * 
     * @throws ZaloApiError
     */
    return async function getAllFriends(count: number = 20000, page: number = 1) {
        const params = {
            incInvalid: 1,
            page,
            count,
            avatar_size: 120,
            actiontime: 0,
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt message");

        const response = await utils.request(
            utils.makeURL(serviceURL, {
                params: encryptedParams,
            }),
            {
                method: "GET",
            },
        );

        return utils.resolve(response);
    };
});
