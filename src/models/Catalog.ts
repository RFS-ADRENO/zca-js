export type Catalog = {
    id: string;
    name: string;
    version: number;
    ownerId: string;
    isDefault: false;
    path: string;
    catalogPhoto: string | null;
    totalProduct: number;
    created_time: number;
};

export type ProductCatalog = {
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
};
