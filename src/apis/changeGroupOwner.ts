import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type ChangeGroupOwnerResponse = {
    time: number;
};

export const changeGroupOwnerFactory = apiFactory<ChangeGroupOwnerResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/change-owner`);

    /**
     * Change group owner
     *
     * @param userId UserId for change group owner
     * @param threadId ThreadId for change group owner
     * @notes Change stupid is lose group rights. Because Web and APP not change key gold (admin main) <(")
     *
     * @throws ZaloApiError
     *
     */
    return async function changeGroupOwner(userId: string, threadId: string) {
        const params = {
            grid: threadId,
            newAdminId: userId,
            imei: ctx.imei,
            language: ctx.language,
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
