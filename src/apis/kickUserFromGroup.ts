import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type KickUserFromGroupResponse = {
    errorMembers: any[];
};

export const kickUserFromGroupFactory = apiFactory<KickUserFromGroupResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/kickout`);

    /**
     * Kick user from group
     *
     * @param groupId Group ID
     * @param memberId Member ID(s)
     * 
     * @throws ZaloApiError
     */
    return async function kickUserFromGroup(groupId: string, memberId: string | string[]) {

        const params = {
            grid: groupId,
            members: Array.isArray(memberId) ? memberId : [memberId],
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
