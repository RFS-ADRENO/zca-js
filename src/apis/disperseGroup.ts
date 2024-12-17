import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory, encodeAES, makeURL, request } from "../utils.js";

export type DisperseGroupResponse = "";

export const disperseGroupFactory = apiFactory<DisperseGroupResponse>()((api, ctx, resolve) => {
    const serviceURL = makeURL(`${api.zpwServiceMap.group[0]}/api/group/disperse`);

    /**
     * Disperse Group
     *
     * @param groupId Group ID to disperse Group from
     *
     * @throws ZaloApiError
     */
    return async function disperseGroup(threadId: string) {
        const params: any = {
            grid: threadId,
            imei: ctx.imei,
        };

        const encryptedParams = encodeAES(ctx.secretKey, JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return resolve(response);
    };
});
