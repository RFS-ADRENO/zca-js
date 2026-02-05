import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils/index.js";

export type UpgradeGroupToCommunityResponse = "";

export const upgradeGroupToCommunityFactory = apiFactory<UpgradeGroupToCommunityResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/upgrade-community`);

    /**
     * Upgrade a group to a community
     *
     * @param groupId Group ID to upgrade
     *
     * @throws {ZaloApiError}
     */
    return async function upgradeGroupToCommunity(groupId: string) {
        const params = {
            grid: groupId,
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
