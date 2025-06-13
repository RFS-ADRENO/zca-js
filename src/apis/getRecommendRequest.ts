import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type CollapseMsgListConfig1 = {
    collapseId: number;
    collapseXItem: number;
    collapseYItem: number;
};

export type RecommInfo1 = {
    source: number;
    message: string;
};

export type BizPkg1 = {
    pkgId: number;
};

export type DataInfo1 = {
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
    recommInfo: RecommInfo1;
    bizPkg: BizPkg1;
    isSeenFriendReq: boolean;
};

export type RecommItem1 = {
    recommItemType: number;
    dataInfo: DataInfo1;
};

export type getRecommendRequestResponse = {
    expiredDuration: number;
    collapseMsgListConfig: CollapseMsgListConfig1;
    recommItems: RecommItem1[];
    isSend?: any;
};

export const getRecommendRequestFactory = apiFactory<getRecommendRequestResponse>()((api, ctx, utils) => {
    const services2URL = utils.makeURL(`${api.zpwServiceMap.friend[1]}/api/friend/recommendsv2/list`);

    /**
     * Get friend requests
     *
     * @throws ZaloApiError
     */
    return async function getRecommendRequest() {
        const params = {
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response2 = await utils.request(utils.makeURL(services2URL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response2);
    };
});
