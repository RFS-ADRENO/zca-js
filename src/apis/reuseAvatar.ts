import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type ReuseAvatarResponse = null;

export const reuseAvatarFactory = apiFactory<ReuseAvatarResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/reuse-avatar`);

    /**
     * Reuse avatar
     *
     * @param photoId photo id from getAvatarList api
     *
     * @throws {ZaloApiError}
     */
    return async function reuseAvatar(photoId: string) {
        const params = {
            photoId: photoId,
            isPostSocial: 0,
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
