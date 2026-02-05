import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils/index.js";

export type UpdateProfileBioResponse = {
    data: {
        bio: string;
    };
};

export const updateProfileBioFactory = apiFactory<UpdateProfileBioResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/profile/update-bio`);

    /**
     * Update user biography
     *
     * @param bio new biography content
     *
     * @throws {ZaloApiError}
     */
    return async function updateProfileBio(bio: string) {
        const params = {
            bio: bio,
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
