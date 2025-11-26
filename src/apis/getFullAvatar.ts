import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetFullAvatarResponse = {
    bk_full_avatar: string;
    full_avatar: string;
};

export const getFullAvatarFactory = apiFactory<GetFullAvatarResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/profile/avatar`);

    /**
     * Get full avatar
     * 
     * @param friendId friend id
     *
     * @throws {ZaloApiError}
     */
    return async function getFullAvatar(friendId: string) {
        const params = {
            fid: friendId,
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
