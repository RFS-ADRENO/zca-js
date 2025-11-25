import { ZaloApiError } from "../Errors/ZaloApiError.js";
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
     * @param isAvatarSizeMax Is avatar size max (default: true)
     *
     * @throws {ZaloApiError}
     */
    return async function getAvatarUrlProfile(friendIds: string | string[], isAvatarSizeMax: boolean = true) {
        if (!Array.isArray(friendIds)) friendIds = [friendIds];

        const params = {
            friend_ids: friendIds,
            avatar_size: isAvatarSizeMax ? 240 : 120,
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
