import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type DeleteProductCatalogPayload = {
    productIds: string | string[];
    catalogId: string;
};

export type DeleteProductCatalogResponse = {
    item: number[];
    version_ls_catalog: number;
    version_catalog: number;
};

export const deleteProductCatalogFactory = apiFactory<DeleteProductCatalogResponse>()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.catalog[0]}/api/prodcatalog/product/mdelete`);

    /**
     * Delete product catalog?
     *
     * @param payload payload
     *
     * @note this API is used for zBusiness
     * @throws {ZaloApiError}
     */
    return async function deleteProductCatalog(payload: DeleteProductCatalogPayload) {
        if (!Array.isArray(payload.productIds)) payload.productIds = [payload.productIds];

        const params = {
            product_ids: payload.productIds,
            catalog_id: payload.catalogId,
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
