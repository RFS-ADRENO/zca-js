import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type AddGroupBlockedMemberResponse = "";

export const addGroupBlockedMemberFactory = apiFactory<AddGroupBlockedMemberResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/blockedmems/add`);

    /**
     * Add group blocked member
     *
     * @param memberId member id(ss)
     * @param groupId group id
     *
     * @throws ZaloApiError
     */
    return async function addGroupBlockedMember(memberId: string | string[], groupId: string) {
        if (!Array.isArray(memberId)) memberId = [memberId];

        const params = {
            grid: groupId,
            members: memberId,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
