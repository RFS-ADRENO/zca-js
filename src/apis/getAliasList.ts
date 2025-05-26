import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetAliasListResponse = {
    items: any[];
    updateTime: string;
};

export const getAliasListFactory = apiFactory<GetAliasListResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.alias[0]}/api/alias/list`);

    /**
     * Get alias list
     *
     * @throws ZaloApiError
     */
    return async function getAliasList() {
        const params = {
            page: 1,
            count: 100,
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
