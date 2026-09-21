'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const getProductCatalogListFactory = utils.apiFactory()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.catalog[0]}/api/prodcatalog/product/list`);
    /**
     * Get product catalog list?
     *
     * @param payload payload
     *
     * @note this API is used for zBusiness
     * @throws {ZaloApiError}
     */
    return async function getProductCatalogList(payload) {
        var _a, _b, _c, _d;
        const params = {
            catalog_id: payload.catalogId,
            limit: (_a = payload.limit) !== null && _a !== void 0 ? _a : 100,
            version_catalog: (_b = payload.versionCatalog) !== null && _b !== void 0 ? _b : 0,
            last_product_id: (_c = payload.lastProductId) !== null && _c !== void 0 ? _c : -1,
            page: (_d = payload.page) !== null && _d !== void 0 ? _d : 0,
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt params");
        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils.resolve(response);
    };
});

exports.getProductCatalogListFactory = getProductCatalogListFactory;
