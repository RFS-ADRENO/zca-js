import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type RemoveGroupDeputyResponse = "";

export const removeGroupDeputyFactory = apiFactory<RemoveGroupDeputyResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/admins/remove`);

    /**
     * Remove group deputy
     *
     * @param memberId user Id or list of user Ids
     * @param groupId group Id
     *
     * @throws ZaloApiError
     *
     */
    return async function removeGroupDeputy(memberId: string | string[], groupId: string) {
        if (!Array.isArray(memberId)) memberId = [memberId];

        const params = {
            grid: groupId,
            members: memberId,
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
