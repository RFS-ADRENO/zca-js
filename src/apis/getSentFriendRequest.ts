import { ZaloApiError } from "../Errors/ZaloApiError.js";
import type { ZBusinessPackage } from "../models/ZBusiness.js";
import { apiFactory } from "../utils.js";

export type SentFriendRequestInfo = {
    userId: string;
    zaloName: string;
    displayName: string;
    avatar: string;
    globalId: string;
    bizPkg: ZBusinessPackage;
    fReqInfo: {
        message: string;
        src: number;
        time: number;
    };
};

export type GetSentFriendRequestResponse = {
    [userId: string]: SentFriendRequestInfo;
};

export const getSentFriendRequestFactory = apiFactory<GetSentFriendRequestResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/requested/list`);

    /**
     * Get friend requested
     *
     * @note Zalo might throw an error with code 112 if you have no friend requests.
     *
     * @throws ZaloApiError
     */
    return async function getSentFriendRequest() {
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
