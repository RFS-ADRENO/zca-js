import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type AvatarListOptions = {
    page?: number;
    count?: number;
};

export type GetAvatarListResponse = {
    albumId: string;
    nextPhotoId: string;
    hasMore: number;
    photos: {
        photoId: string;
        thumbnail: string;
        url: string;
        bkUrl: string;
    }[];
};

export const getAvatarListFactory = apiFactory<GetAvatarListResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/avatar-list`);

    /**
     * Get avatar list
     *
     * @param options options
     *
     * @throws ZaloApiError
     */
    return async function getAvatarList(options: AvatarListOptions) {
        const params = {
            page: options.page ?? 1,
            albumId: "0",
            count: options.count ?? 50,
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
