import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type PhotoMeta = {
    sendDttm: number;
}

export type GetProfileExtraResponse = {
    totalPhotos: number;
    photos: string[];
    groupIds: string[];
    photoMetas: PhotoMeta[];
    bkPhotos: string[];
};

export const getProfileExtraFactory = apiFactory<GetProfileExtraResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/profile/extra`);

    /**
     * Get profile extra information
     *
     * @param profileId The ID of the profile for which to get extra information
     *
     * @throws {ZaloApiError}
     */
    return async function getProfileExtra(profileId: string) {
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
