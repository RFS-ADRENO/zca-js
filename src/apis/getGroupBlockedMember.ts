import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetGroupBlockedMemberPayload = {
    page?: number;
    count?: number;
};

export type GetGroupBlockedMemberResponse = {
    blocked_members: {
        id: string;
        dName: string;
        zaloName: string;
        avatar: string;
        avatar_25: string;
        accountStatus: number;
        type: number;
    }[];
    has_more: number;
};

export const getGroupBlockedMemberFactory = apiFactory<GetGroupBlockedMemberResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/blockedmems/list`);

    /**
     * Get group blocked member
     *
     * @param payload payload
     * @param groupId group id
     *
     * @throws ZaloApiError
     */
    return async function getGroupBlockedMember(payload: GetGroupBlockedMemberPayload, groupId: string) {
        const params = {
            grid: groupId,
            page: payload.page ?? 1,
            count: payload.count ?? 50,
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
