import { ZaloApiError } from "../Errors/ZaloApiError.js";
import type { User } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type GetCloseFriendsResponse = User[];

export const getCloseFriendsFactory = apiFactory<GetCloseFriendsResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/friend/getclosedfriends`);

    /**
     * Get close friends
     *
     * @throws {ZaloApiError}
     */
    return async function getCloseFriends() {
        const params = {};

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
