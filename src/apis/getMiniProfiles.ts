import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

import { AvatarSize, type ZBusinessPackage } from "../models/index.js";

export enum MiniProfileType {
	/** Normal user */
	User = 0,
	/** Official Account */
	OA = 5,
	/** Official Account owned by Zalo, for example: Zalo To-Do, zCloud */
	ZOA = 7,
}

export type GetMiniProfilesResponse = {
    [userId: string]: {
        userId: string;
        avatar: string;
        globalId: string;
        type: MiniProfileType;
        bizPkg: ZBusinessPackage;
        oaInfo: null; // @TODO: check type
        zaloName: string;
    };
};

export const getMiniProfilesFactory = apiFactory<GetMiniProfilesResponse>()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/friend/getminiprofiles`);

    /**
     * Get mini profiles for users
     *
     * @param userId User ID or list of user IDs
     * @param avatarSize Size of the avatar to retrieve
     *
     * @throws {ZaloApiError}
     */
    return async function getMiniProfiles(userId: string | string[], avatarSize: AvatarSize = AvatarSize.Medium) {
        if (!userId) throw new ZaloApiError("Missing user id");

        if (!Array.isArray(userId)) userId = [userId];

        const params = {
            friend_ids: userId,
            avatar_size: avatarSize,
            incInvalid: 1,
            srcReq: 5,
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
