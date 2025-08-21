import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type CreateProductCatalogPayload = {
    productName: string;
    price: string;
    description: string;
};

export type CreateProductCatalogResponse = {
    item: {
        price: string;
        description: string;
        path: string; // https://catalog.zalo.me/path | eg: https://catalog.zalo.me/?pid=5340b4a0a2e54bbb12f4
        product_id: string;
        product_name: string;
        currency_unit: string;
        product_photos: string[];
        create_time: number;
        catalog_id: string;
        owner_id: string;
    };
    version_ls_catalog: number;
    version_catalog: number;
};

export const createProductCatalogFactory = apiFactory<CreateProductCatalogResponse>()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.catalog[0]}/api/prodcatalog/product/create`);

    /**
     * Create product catalog?
     *
     * @param payload payload
     *
     * @note this API is used for zBussiness
     * @throws ZaloApiError
     */
    return async function createProductCatalog(payload: CreateProductCatalogPayload) {
        const catalogId = (await api.getCatalogList({
            limit: 1,
            page: 0,
        })).items[0].id;

        const params = {
            create_time: Date.now(),
            product_name: payload.productName,
            price: payload.price,
            description: payload.description,
            product_photos: [], // @TODO: implement uploadProduct
            // product_photos: ["https://f1-zpprd.zdn.vn/4450177398404879829/003ed3d8d72f5f71063e.jpg"],
            catalog_id: catalogId,
            currency_unit: "₫", // $
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
