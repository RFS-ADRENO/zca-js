import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";
export const createProductCatalogFactory = apiFactory()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.catalog[0]}/api/prodcatalog/product/create`);
    /**
     * Create product catalog?
     *
     * @param payload payload
     *
     * @note this API is used for zBussiness - Maximum 5 media files are supported
     * @throws {ZaloApiError}
     */
    return async function createProductCatalog(payload) {
        const productPhoto = payload.product_photos || [];
        if (payload.files && payload.files.length == 0) {
            if (payload.files.length > 5) {
                throw new ZaloApiError("Maximum 5 media files are allowed");
            }
            for (const mediaFile of payload.files) {
                const uploadMedia = await api.uploadProductPhoto({
                    file: mediaFile,
                });
                const url = uploadMedia.normalUrl || uploadMedia.hdUrl;
                productPhoto.push(url);
            }
        }
        if (productPhoto.length > 5) {
            throw new ZaloApiError("Maximum 5 media files are allowed");
        }
        const params = {
            product_name: payload.productName,
            price: payload.price,
            description: payload.description,
            product_photos: productPhoto,
            catalog_id: payload.catalogId,
            currency_unit: "₫", // $
            create_time: Date.now(),
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError("Failed to encrypt params");
        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils.resolve(response);
    };
});
