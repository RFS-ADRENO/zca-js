import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetProfileRankResponse = {
    userRank: string;
};

export const getProfileRankFactory = apiFactory<GetProfileRankResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/profile/getrank`);

    /**
     * Get profile rank information
     *
     * @param profileId The ID of the profile for which to get rank information
     *
     * @throws {ZaloApiError}
     */
    return async function getProfileRank(profileId: string) {
        const params = {
            profile_id: profileId,
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
