import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type UpgradeGroupToCommunityResponse = "";

export const upgradeGroupToCommunityFactory = apiFactory<UpgradeGroupToCommunityResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/upgrade/community`);

    /**
     * Upgrade group to community
     *
     * @param groupId Group ID upgrade
     *
     * @note Zalo account identity must be verified and the account must be over 18 to use
     * @code 185 The limit on the number of communities that can own has been reached
     * @throws {ZaloApiError}
     */
    return async function upgradeGroupToCommunity(groupId: string) {
        const params = {
            grId: groupId,
            language: ctx.language,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
