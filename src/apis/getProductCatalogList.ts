import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetProductCatalogListPayload = {
    catalogId: string; // use api getCatalogList to get catalogId
    limit?: number;
    versionCatalog?: number;
    lastProductId?: string;
    page?: number;
};

export type GetProductCatalogListResponse = {
    items: {
        price: string;
        description: string;
        path: string;
        product_id: string;
        product_name: string;
        currency_unit: string;
        product_photos: string[];
        create_time: number;
        catalog_id: string;
        owner_id: string;
    }[];
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
