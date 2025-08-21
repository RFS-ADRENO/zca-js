import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type CreateCatalogResponse = {
    item: {
        id: string;
        name: string;
        version: number;
        ownerId: string;
        isDefault: false;
        path: string; // https://catalog.zalo.me/path | eg: https://catalog.zalo.me/?cid=CzdAIJoVcGeqlCv0GFtl5qxRnredcE9rIjh49IULad58rS1SE-gQS0 link main is show product list
        catalogPhoto: string | null;
        totalProduct: number;
        created_time: number;
    };
    version_ls_catalog: 8;
    version_catalog: 0;
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
