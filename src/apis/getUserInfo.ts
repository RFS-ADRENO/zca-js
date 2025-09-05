import { ZaloApiError } from "../Errors/ZaloApiError.js";
import type { User } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type ProfileInfo = User;

export type UserInfoResponse = {
    unchanged_profiles: Record<string, unknown>;
    phonebook_version: number;
    changed_profiles: Record<string, ProfileInfo>;
};

export const getUserInfoFactory = apiFactory<UserInfoResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/friend/getprofiles/v2`);

    /**
     * Get user info using user id
     *
     * @param userId user id
     *
     * @throws ZaloApiError
     */
    return async function getUserInfo(userId: string | string[]) {
        if (!userId) throw new ZaloApiError("Missing user id");

        if (!Array.isArray(userId)) userId = [userId];

        userId = userId.map((id) => {
            if (id.split("_").length > 1) {
                return id;
            }
            return `${id}_0`;
        });

        const params = {
            phonebook_version: ctx.extraVer!.phonebook,
            friend_pversion_map: userId,
            avatar_size: 120,
            language: ctx.language,
            show_online_status: 1,
            imei: ctx.imei,
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
