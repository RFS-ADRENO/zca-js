import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";
export const getCatalogListFactory = apiFactory()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.catalog[0]}/api/prodcatalog/catalog/list`);
    /**
     * Get catalog list?
     *
     * @param payload payload
     *
     * @note this API is used for zBusiness
     * @throws {ZaloApiError}
     */
    return async function getCatalogList(payload) {
        var _a, _b, _c;
        const params = {
            version_list_catalog: 0,
            limit: (_a = payload === null || payload === void 0 ? void 0 : payload.limit) !== null && _a !== void 0 ? _a : 20,
            last_product_id: (_b = payload === null || payload === void 0 ? void 0 : payload.lastProductId) !== null && _b !== void 0 ? _b : -1,
            page: (_c = payload === null || payload === void 0 ? void 0 : payload.page) !== null && _c !== void 0 ? _c : 0,
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
