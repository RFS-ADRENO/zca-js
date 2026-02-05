import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils/index.js";

import type { User } from "../../models/index.js";

export type GetAllFriendsResponse = User[];

export const getAllFriendsFactory = apiFactory<GetAllFriendsResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/friend/getfriends`);

    /**
     * Get all friends
     *
     * @param count Page size (default: 20000)
     * @param page Page number (default: 1)
     * @param isAvatarSizeMax Is avatar size max (default: false)
     *
     * @throws {ZaloApiError}
     */
    return async function getAllFriends(count: number = 20000, page: number = 1, isAvatarSizeMax: boolean = false) {
        const params = {
            incInvalid: 1,
            page,
            count,
            avatar_size: isAvatarSizeMax ? 240 : 120,
            actiontime: 0,
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt message");

        const response = await utils.request(
            utils.makeURL(serviceURL, {
                params: encryptedParams,
            }),
            {
                method: "GET",
            },
        );

        return utils.resolve(response);
    };
});
