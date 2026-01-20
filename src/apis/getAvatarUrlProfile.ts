import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { AvatarSize } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type GetAvatarUrlProfileResponse = {
    [userId: string]: {
        avatar: string;
    };
};

export const getAvatarUrlProfileFactory = apiFactory<GetAvatarUrlProfileResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/profile/avatar-url`);

    /**
     * Get avatar url profile
     *
     * @param friendId friend id(s)
     * @param avatarSize Avatar size (default: AvatarSize.Large)
     *
     * @throws {ZaloApiError}
     */
    return async function getAvatarUrlProfile(friendIds: string | string[], avatarSize: AvatarSize = AvatarSize.Large) {
        if (!Array.isArray(friendIds)) friendIds = [friendIds];

        const params = {
            friend_ids: friendIds,
            avatar_size: avatarSize,
            srcReq: -1,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
