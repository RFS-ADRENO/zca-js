import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

import type { ProductCatalogItem } from "../models/index.js";

export type GetProductCatalogListPayload = {
    catalogId: string;
    /**
     * Number of items to retrieve (default: 100)
     */
    limit?: number;
    versionCatalog?: number;
    lastProductId?: string;
    /**
     * Page number (default: 0)
     */
    page?: number;
};

export type GetProductCatalogListResponse = {
    items: ProductCatalogItem[];
    version: number;
    has_more: number;
};

export const getProductCatalogListFactory = apiFactory<GetProductCatalogListResponse>()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.catalog[0]}/api/prodcatalog/product/list`);

    /**
     * Get product catalog list?
     *
     * @param payload payload
     *
     * @note this API is used for zBusiness
     * @throws ZaloApiError
     */
    return async function getProductCatalogList(payload: GetProductCatalogListPayload) {
        const params = {
            catalog_id: payload.catalogId,
            limit: payload.limit ?? 100,
            version_catalog: payload.versionCatalog ?? 0,
            last_product_id: payload.lastProductId ?? -1,
            page: payload.page ?? 0,
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
