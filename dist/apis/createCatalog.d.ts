import type { CatalogItem } from "../models/index.js";
export type CreateCatalogResponse = {
    item: CatalogItem;
    version_ls_catalog: number;
    version_catalog: number;
};
export declare const createCatalogFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (catalogName: string) => Promise<CreateCatalogResponse>;
