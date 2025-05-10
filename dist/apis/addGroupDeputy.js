import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";
export const addGroupDeputyFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/admins/add`);
    /**
     * Add group deputy
     *
     * @param memberId user Id or list of user Ids
     * @param groupId group Id
     *
     * @throws ZaloApiError
     *
     */
    return async function addGroupDeputy(memberId, groupId) {
        if (!Array.isArray(memberId))
            memberId = [memberId];
        const params = {
            grid: groupId,
            members: memberId,
            imei: ctx.imei,
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError("Failed to encrypt params");
        const urlWithParams = `${serviceURL}&params=${encodeURIComponent(encryptedParams)}`;
        const response = await utils.request(urlWithParams, {
            method: "GET",
        });
        return utils.resolve(response);
    };
});
