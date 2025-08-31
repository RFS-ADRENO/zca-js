import { ZaloApiError } from "../Errors/ZaloApiError.js";
import type { Catalog } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type CreateCatalogResponse = {
    item: Catalog;
    version_ls_catalog: number;
    version_catalog: number;
};

export const createCatalogFactory = apiFactory<CreateCatalogResponse>()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.catalog[0]}/api/prodcatalog/catalog/create`);

    /**
     * Create catalog?
     *
     * @param catalogName catalog name
     *
     * @note this API is used for zBusiness
     * @throws ZaloApiError
     */
    return async function createCatalog(catalogName: string) {
        const params = {
            catalog_name: catalogName,
            catalog_photo: "", // "" is defaut don't upload photo
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
