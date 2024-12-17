import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory, encodeAES, makeURL, request } from "../utils.js";

export type RemoveGroupDeputyResponse = "";

export const removeGroupDeputyFactory = apiFactory<RemoveGroupDeputyResponse>()((api, ctx, resolve) => {
    const serviceURL = makeURL(`${api.zpwServiceMap.group[0]}/api/group/admins/remove`);

    /**
     * Remove group deputy
     *
     * @param userId UserId for change group owner
     * @param threadId ThreadId for change group owner
     *
     * @throws ZaloApiError
     *
     */
    return async function removeGroupDeputy(userId: string[], threadId: string) {
        if (!Array.isArray(userId)) userId = [userId];

        const params = {
            grid: threadId,
            members: userId,
            imei: ctx.imei,
        };

        const encryptedParams = encodeAES(ctx.secretKey, JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const urlWithParams = `${serviceURL}&params=${encodeURIComponent(encryptedParams)}`;

        const response = await request(urlWithParams, {
            method: "GET",
        });

        return resolve(response);
    };
});
