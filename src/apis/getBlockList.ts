import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { AvatarSize, type ProfileInfo } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type GetBlockListResponse = {
    profiles: ProfileInfo[];
    version: number;
    hasMore: number;
};

export const getBlockListFactory = apiFactory<GetBlockListResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/blocklistv2`);

    /**
     * Get block list
     *
     * @param page Page number (default: 1)
     * @param count Number of items per page (default: 50)
     * @param avatarSize Avatar size (default: AvatarSize.Small)
     *
     * @throws {ZaloApiError}
     */
    return async function getBlockList(page: number = 1, count: number = 50, avatarSize: AvatarSize = AvatarSize.Small) {
        const params = {
            page: page,
            count: count,
            avatar_size: avatarSize,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
