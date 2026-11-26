import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetQuotaCommunityResponse = {
    error_message_localize: string;
    canUpgr: boolean;
    curComm: number;
    quotaComm: number;
};

export const getQuotaCommunityFactory = apiFactory<GetQuotaCommunityResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/quota/community`);

    /**
     * Get quota community
     *
     * @param groupId The ID of the group for which to get quota information
     *
     * @throws {ZaloApiError}
     */
    return async function getQuotaCommunity(groupId: string) {
        const params = {
            language: ctx.language,
            grId: groupId,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
