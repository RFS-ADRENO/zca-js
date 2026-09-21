import type { AttachmentSource, ProductCatalogItem } from "../models/index.js";
export type CreateProductCatalogPayload = {
    catalogId: string;
    productName: string;
    price: string;
    description: string;
    /**
     * Upto 5 media files are allowed, will be ignored if product_photos is provided
     */
    files?: AttachmentSource[];
    /**
     * List of product photo URLs, upto 5
     *
     * You can manually get the URL using `uploadProductPhoto` api
     */
    product_photos?: string[];
};
export type CreateProductCatalogResponse = {
    item: ProductCatalogItem;
    version_ls_catalog: number;
    version_catalog: number;
};
export declare const createProductCatalogFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (payload: CreateProductCatalogPayload) => Promise<CreateProductCatalogResponse>;
