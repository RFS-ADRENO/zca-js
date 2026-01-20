import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

import { AvatarSize, type UserBasic } from "../models/index.js";

export type FindUserByUsernameResponse = UserBasic;

export const findUserByUsernameFactory = apiFactory<FindUserByUsernameResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/search/by-user-name`);

    /**
     * Find user by username
     *
     * @param username username for find
     * @param avatarSize Avatar size (default: AvatarSize.Large)
     *
     * @throws {ZaloApiError}
     */
    return async function findUserByUsername(username: string, avatarSize: AvatarSize = AvatarSize.Large) {
        const params = {
            user_name: username,
            avatar_size: avatarSize,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
