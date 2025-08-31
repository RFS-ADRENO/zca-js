import { ZaloApiError } from "../Errors/ZaloApiError.js";
import type { AttachmentSource } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type CreateProductCatalogPayload = {
    catalogId: string;
    productName: string;
    price: string;
    description: string;

    /**
     * Upto 5 media files are allowed
     */
    file?: AttachmentSource[];
};

export type CreateProductCatalogResponse = {
    item: {
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
     * @note this API is used for zBussiness - Maximum 5 media files are supported
     * @throws ZaloApiError
     */
    return async function createProductCatalog(payload: CreateProductCatalogPayload) {
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
            create_time: Date.now(),
            product_name: payload.productName,
            price: payload.price,
            description: payload.description,
            product_photos: productPhoto,
            catalog_id: payload.catalogId,
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
