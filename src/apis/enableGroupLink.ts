import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type EnableGroupLinkResponse = {
    link: string;
    expiration_date: number;
    enabled: number;
};

export const enableGroupLinkFactory = apiFactory<EnableGroupLinkResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/link/new`);

    /**
     * Enable group link
     *
     * @param groupId The group id
     *
     * @throws ZaloApiError
     */
    return async function enableGroupLink(groupId: string) {
        const params = {
            grid: groupId,
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
