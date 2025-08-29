import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type UpdateCatalogPayload = {
    catalogId: string; // use api getCatalogList to get catalogId
    catalogName: string;
};

export type UpdateCatalogResponse = {
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
    version_ls_catalog: number;
    version_catalog: number;
};

export const updateCatalogFactory = apiFactory<UpdateCatalogResponse>()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.catalog[0]}/api/prodcatalog/catalog/update`);

    /**
     * Update catalog?
     *
     * @param payload payload
     *
     * @note this API is used for zBusiness
     * @throws ZaloApiError
     */
    return async function updateCatalog(payload: UpdateCatalogPayload) {
        const params = {
            catalog_id: payload.catalogId,
            catalog_name: payload.catalogName,
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
