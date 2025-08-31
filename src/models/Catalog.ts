export type CatalogItem = {
    id: string;
    name: string;
    version: number;
    ownerId: string;
    isDefault: boolean;
    /**
     * Relative path used to build the catalog URL.
     *
     * Example: `https://catalog.zalo.me/${path}`
     */
    path: string;
    catalogPhoto: string | null;
    totalProduct: number;
    created_time: number;
};
