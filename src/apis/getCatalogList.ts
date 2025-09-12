import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

import type { CatalogItem } from "../models/index.js";

export type GetCatalogListPayload = {
    /**
     * Number of items to retrieve (default: 20)
     */
    limit?: number;
    lastProductId?: number;
    /**
     * Page number (default: 0)
     */
    page?: number;
};

export type GetCatalogListResponse = {
    items: CatalogItem[];
    version: number;
    has_more: number;
};

export const getCatalogListFactory = apiFactory<GetCatalogListResponse>()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.catalog[0]}/api/prodcatalog/catalog/list`);

    /**
     * Get catalog list?
     *
     * @param payload payload
     *
     * @note this API is used for zBusiness
     * @throws {ZaloApiError}
     */
    return async function getCatalogList(payload?: GetCatalogListPayload) {
        const params = {
            version_list_catalog: 0,
            limit: payload?.limit ?? 20,
            last_product_id: payload?.lastProductId ?? -1,
            page: payload?.page ?? 0,
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
