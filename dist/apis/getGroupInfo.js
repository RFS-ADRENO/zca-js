import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";
export const getGroupInfoFactory = apiFactory()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/getmg-v2`);
    /**
     * Get group information
     *
     * @param groupId Group ID or list of group IDs
     *
     * @throws ZaloApiError
     */
    return async function getGroupInfo(groupId) {
        if (!Array.isArray(groupId))
            groupId = [groupId];
        let params = {
            gridVerMap: {},
        };
        for (const id of groupId) {
            params.gridVerMap[id] = 0;
        }
        params.gridVerMap = JSON.stringify(params.gridVerMap);
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError("Failed to encrypt message");
        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils.resolve(response);
    };
});
