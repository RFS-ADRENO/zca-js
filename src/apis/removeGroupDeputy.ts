import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type RemoveGroupDeputyResponse = "";

export const removeGroupDeputyFactory = apiFactory<RemoveGroupDeputyResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/admins/remove`);

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

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const urlWithParams = `${serviceURL}&params=${encodeURIComponent(encryptedParams)}`;

        const response = await utils.request(urlWithParams, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
