import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type BlockViewFeedResponse = "";

export const blockViewFeedFactory = apiFactory<BlockViewFeedResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/feed/block`);

    /**
     * Block/Unblock friend view feed by ID
     *
     * @param userId User ID to block/unblock view feed
     * @param isBlockFeed Boolean to block/unblock view feed
     *
     * @throws ZaloApiError
     */
    return async function blockViewFeed(userId: string, isBlockFeed: boolean = true) {
        const params: any = {
            fid: userId,
            isBlockFeed: isBlockFeed ? 1 : 0,
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
