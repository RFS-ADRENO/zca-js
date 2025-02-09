import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type DisperseGroupResponse = "";

export const disperseGroupFactory = apiFactory<DisperseGroupResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/disperse`);

    /**
     * Disperse Group
     *
     * @param groupId Group ID to disperse Group from
     *
     * @throws ZaloApiError
     */
    return async function disperseGroup(groupId: string) {
        const params: any = {
            grid: groupId,
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
