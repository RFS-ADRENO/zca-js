import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GroupMemberProfile = {
    displayName: string;
    zaloName: string;
    avatar: string;
    accountStatus: number;
    type: number;
    lastUpdateTime: number;
    globalId: string;
    id: string;
};

export type GetGroupMembersInfoResponse = {
    profiles: {
        [memberId: string]: GroupMemberProfile;
    };
    unchangeds_profile: unknown[];
};

export const getGroupMembersInfoFactory = apiFactory<GetGroupMembersInfoResponse>()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/group/members`);

    /**
     * Get group information
     *
     * @param memberId member id or array of member ids
     *
     * @throws ZaloApiError
     */
    return async function getGroupMembersInfo(memberId: string | string[]) {
        if (!Array.isArray(memberId)) memberId = [memberId];

        const params = {
            friend_pversion_map: memberId.map((id) => (id.endsWith("_0") ? id : `${id}_0`)),
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt message");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }));

        return utils.resolve(response);
    };
});