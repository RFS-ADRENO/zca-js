import { ZaloApiError } from "../Errors/ZaloApiError.js";
import type { AttachmentSource, ProductCatalog } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type UpdateProductCatalogPayload = {
    productName: string; // change name product
    price: string; // change price product
    description: string; // change description product
    productId: string; // use api getProductCatalogList to get productId
    createTime: number; // use api getProductCatalogList to get createTime
    catalogId: string; // use api getCatalogList to get catalogId

    file?: AttachmentSource[]; // Array of media files, max 5
};

export type UpdateProductCatalogResponse = {
    item: ProductCatalog;
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
     * @note this API is used for zBusiness - Maximum 5 media files are supported
     * @throws ZaloApiError
     */
    return async function updateProductCatalog(payload: UpdateProductCatalogPayload) {
        const productPhoto = [];

        if (payload.file) {
            if (payload.file.length > 5) {
                throw new ZaloApiError("Maximum 5 media files are allowed");
            }

            for (const mediaFile of payload.file) {
                const uploadMedia = await api.uploadProductPhoto({
                    file: mediaFile,
                });

                const url = uploadMedia.normalUrl || uploadMedia.hdUrl;
                productPhoto.push(url);
            }
        }

        const params = {
            product_id: payload.productId,
            product_name: payload.productName,
            price: payload.price,
            description: payload.description,
            product_photos: productPhoto,
            catalog_id: payload.catalogId,
            currency_unit: "₫",
            create_time: payload.createTime,
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
