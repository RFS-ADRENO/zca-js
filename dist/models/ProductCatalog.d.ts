export type ProductCatalogItem = {
    price: string;
    description: string;
    /**
     * Relative path used to build the product URL.
     *
     * Example: https://catalog.zalo.me/${path}
     */
    path: string;
    product_id: string;
    product_name: string;
    currency_unit: string;
    product_photos: string[];
    create_time: number;
    catalog_id: string;
    owner_id: string;
};
