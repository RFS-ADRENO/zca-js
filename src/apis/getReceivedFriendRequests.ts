import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { Gender } from "../models/Enum.js";
import { apiFactory } from "../utils.js";

export type CollapseMsgListConfig = {
    collapseId: number;
    collapseXItem: number;
    collapseYItem: number;
};

export type ReceivedFriendRequestsDataInfo = {
    userId: string;
    zaloName: string;
    displayName: string;
    avatar: string;
    phoneNumber: string;
    status: string;
    gender: Gender;
    dob: number;
    type: number;
    recommType: number;
    recommSrc: number;
    recommTime: number;
    recommInfo: {
        source: number;
        message: string;
    };
    bizPkg: {
        pkgId: number;
    };
    isSeenFriendReq: boolean;
};

export type GetReceivedFriendRequestsResponse = {
    expiredDuration: number;
    collapseMsgListConfig: CollapseMsgListConfig;
    recommItems: {
        recommItemType: number;
        dataInfo: ReceivedFriendRequestsDataInfo;
    }[];
};

export const getReceivedFriendRequestsFactory = apiFactory<GetReceivedFriendRequestsResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/recommendsv2/list`);

    /**
     * Get received friend requests
     *
     * @throws ZaloApiError
     */
    return async function getReceivedFriendRequests() {
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
