import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetExtraGroupInfoResponse = {
    [groupID: string]: {
        purpose: string;
        role: string[];
    };
};

export const getExtraGroupInfoFactory = apiFactory<GetExtraGroupInfoResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/userctx/multiget`);

    /**
     * Get extra group info
     * 
     * @param groupID Group ID or list of group IDs
     *
     * @throws {ZaloApiError}
     */
    return async function getExtraGroupInfo(groupID: string | string[]) {
        if (!groupID) throw new ZaloApiError("Missing group id");

        if (!Array.isArray(groupID)) groupID = [groupID];

        const params = {
            grids: groupID,
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
