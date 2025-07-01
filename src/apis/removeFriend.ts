import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type RemoveFriendOptions = {
    fid: string;
};

export type RemoveFriendResponse = "";

export const removeFriendFactory = apiFactory<RemoveFriendResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/remove`);;

    /**
     * Remove friend
     *
     * @param options Friend ID
     *
     * @throws ZaloApiError
     */
    return async function removeFriend(options: RemoveFriendOptions) {
        const params = {
            fid: options.fid,
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
