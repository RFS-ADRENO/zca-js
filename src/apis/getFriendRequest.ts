import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetFriendRequestResponse = {
    [key: string]: {
        userId: string;
        zaloName: string;
        displayName: string;
        avatar: string;
        globalId: string;
        bizPkg: {
            pkgId: number;
        };
        fReqInfo: {
            message: string;
            src: number;
            time: number;
        };
    };
};

export const getFriendRequestFactory = apiFactory<GetFriendRequestResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/requested/list`);

    /**
     * Get friend requested
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
