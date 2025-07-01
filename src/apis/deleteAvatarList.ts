import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type DeleteAvatarListOptions = {
    photoId: string | string[];
};

export type DeleteAvatarListResponse = {
    delPhotoIds: string[];
    errMap: {
        [key: string]: {
            err: number;
        };
    };
};

export const deleteAvatarListFactory = apiFactory<DeleteAvatarListResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/del-avatars`);

    /**
     * Delete avatar list
     *
     * @param options.photoId avatar photo ID(s) to delete - can be a single string or array of strings
     *
     * @throws ZaloApiError
     */
    return async function deleteAvatarList(options: DeleteAvatarListOptions) {
        const { photoId } = options;
        const photoIds = Array.isArray(photoId) ? photoId : [photoId];
        const delPhotos = photoIds.map((id) => ({ photoId: id }));

        const params = {
            delPhotos: JSON.stringify(delPhotos),
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
