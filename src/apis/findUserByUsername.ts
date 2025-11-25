import { ZaloApiError } from "../Errors/ZaloApiError.js";
import type { Gender, ZBusinessPackage } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type FindUserByUsernameResponse = {
    avatar: string;
    cover: string;
    status: string;
    gender: Gender;
    dob: number;
    sdob: string;
    globalId: string;
    bizPkg: ZBusinessPackage;
    uid: string;
    zalo_name: string;
    display_name: string;
};

export const findUserByUsernameFactory = apiFactory<FindUserByUsernameResponse>()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/search/by-user-name`);

    /**
     * Find user by username
     *
     * @param username username for find
     * @param avatarSize Avatar size default 240 and 120
     *
     * @throws {ZaloApiError}
     */
    return async function findUserByUsername(username: string, avatarSize: number = 240) {
        const params = {
            user_name: username,
            avatar_size: avatarSize ?? 120,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
