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
export declare const getProductCatalogListFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (payload: GetProductCatalogListPayload) => Promise<GetProductCatalogListResponse>;
