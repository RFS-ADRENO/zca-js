export type DeleteProductCatalogPayload = {
    productIds: string | string[];
    catalogId: string;
};
export type DeleteProductCatalogResponse = {
    item: number[];
    version_ls_catalog: number;
    version_catalog: number;
};
export declare const deleteProductCatalogFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (payload: DeleteProductCatalogPayload) => Promise<DeleteProductCatalogResponse>;
