import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type DisableGroupLinkResponse = "";

export const disableGroupLinkFactory = apiFactory<DisableGroupLinkResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/link/disable`);

    /**
     * Disable group link
     *
     * @param groupId The group id
     *
     * @throws ZaloApiError
     */
    return async function disableGroupLink(groupId: string) {
        const params = {
            grid: groupId,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
