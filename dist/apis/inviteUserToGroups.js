import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";
export const inviteUserToGroupsFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/invite/multi`);
    /**
     * Invite user to group
     *
     * @param groupId group ID(s)
     * @param memberId member ID
     *
     * @throws ZaloApiError
     *
     */
    return async function inviteUserToGroups(memberId, groupId) {
        const params = {
            grids: Array.isArray(groupId) ? groupId : [groupId],
            member: memberId,
            memberType: -1,
            srcInteraction: 2,
            clientLang: ctx.language,
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError("Failed to encrypt params");
        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });
        return utils.resolve(response);
    };
});
