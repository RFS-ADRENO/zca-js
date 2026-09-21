import type { CatalogItem } from "../models/index.js";
export type UpdateCatalogPayload = {
    catalogId: string;
    catalogName: string;
};
export type UpdateCatalogResponse = {
    item: CatalogItem;
    version_ls_catalog: number;
    version_catalog: number;
};
export declare const updateCatalogFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (payload: UpdateCatalogPayload) => Promise<UpdateCatalogResponse>;
