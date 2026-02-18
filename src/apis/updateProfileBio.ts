import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type UpdateProfileBioResponse = "";

export const updateProfileBioFactory = apiFactory<UpdateProfileBioResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/profile/status`);

    /**
     * Update profile bio
     *
     * @param status status for update bio
     *
     * @throws {ZaloApiError}
     */
    return async function updateProfileBio(status: string) {
        const params = {
            status: status,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
