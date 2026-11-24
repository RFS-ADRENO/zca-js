import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetExtraFriendInfoResponse = {
    [friendID: string]: {
        purpose: string;
        role: string[];
    };
};

export const getExtraFriendInfoFactory = apiFactory<GetExtraFriendInfoResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/context/multiget`);

    /**
     * Get extra friend info
     * 
     * @param friendID Friend ID or list of friend IDs
     *
     * @throws {ZaloApiError}
     */
    return async function getExtraFriendInfo(friendID: string | string[]) {
        if (!friendID) throw new ZaloApiError("Missing friend id");

        if (!Array.isArray(friendID)) friendID = [friendID];

        const params = {
            fids: friendID,
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
