import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetAliasListResponse = {
    items: {
        userId: string;
        alias: string;
    }[];
    updateTime: string;
};

export const getAliasListFactory = apiFactory<GetAliasListResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.alias[0]}/api/alias/list`);

    /**
     * Get alias list
     * 
     * @param count Page size (default: 100)
     * @param page Page number (default: 1)
     *
     * @throws ZaloApiError
     */
    return async function getAliasList(count: number = 100, page: number = 1) {
        const params = {
            page,
            count,
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
