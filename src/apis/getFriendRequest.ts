import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type CollapseMsgListConfig = {
    collapseId: number;
    collapseXItem: number;
    collapseYItem: number;
};

export type RecommInfo = {
    source: number;
    message: string;
};

export type BizPkg = {
    pkgId: number;
};

export type DataInfo = {
    userId: string;
    zaloName: string;
    displayName: string;
    avatar: string;
    phoneNumber: string;
    status: string;
    gender: number;
    dob: number;
    type: number;
    recommType: number;
    recommSrc: number;
    recommTime: number;
    recommInfo: RecommInfo;
    bizPkg: BizPkg;
    isSeenFriendReq: boolean;
};

export type RecommItem = {
    recommItemType: number;
    dataInfo: DataInfo;
};

export type GetFriendRequestResponse = {
    expiredDuration: number;
    collapseMsgListConfig: CollapseMsgListConfig;
    recommItems: RecommItem[];
};

export const getFriendRequestFactory = apiFactory<GetFriendRequestResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/recommendsv2/list`);

    /**
     * Get friend requests
     *
     * @throws ZaloApiError
     */
    return async function getFriendRequest() {
        const params = {
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
