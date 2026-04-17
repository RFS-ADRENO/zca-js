import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type RegisterCatalogResponse = {
    status: boolean;
};

export const registerCatalogFactory = apiFactory<RegisterCatalogResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.catalog[0]}/api/prodcatalog/catalog/register`);

    /**
     * Register catalog
     * 
     * @param enable enable or disable catalog
     * 
     * @throws {ZaloApiError}
     */
    return async function registerCatalog(enable: boolean) {
        const params = {
            enable: enable ? 1 : 0,
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
