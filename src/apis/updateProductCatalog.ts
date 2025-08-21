import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type UpdateProductCatalogPayload = {
    productName: string; // change name product
    price: string; // change price product
    description: string; // change description product
    path: string; // use api getProductCatalogList to get path
    productId: string; // use api getProductCatalogList to get productId
    createTime: number; // use api getProductCatalogList to get createTime
    catalogId: string; // use api getCatalogList to get catalogId
    ownerId: string; // use api getCatalogList to get ownerId
};

export type UpdateProductCatalogResponse = {
    item: {
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
    version_ls_catalog: number;
    version_catalog: number;
};

export const updateProductCatalogFactory = apiFactory<UpdateProductCatalogResponse>()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.catalog[0]}/api/prodcatalog/product/update`);

    /**
     * Update product catalog?
     *
     * @param payload payload
     *
     * @note this API is used for zBusiness
     * @throws ZaloApiError
     */
    return async function updateProductCatalog(payload: UpdateProductCatalogPayload) {
        const params = {
            price: payload.price,
            description: payload.description,
            path: payload.path,
            product_id: payload.productId,
            product_name: payload.productName,
            currency_unit: "₫", // $
            product_photos: [], // @TODO: implement uploadPhoto
            create_time: payload.createTime,
            catalog_id: payload.catalogId,
            owner_id: payload.ownerId,
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
