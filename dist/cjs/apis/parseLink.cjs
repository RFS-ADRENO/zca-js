'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const parseLinkFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.file[0]}/api/message/parselink`);
    /**
     * Parse link
     *
     * @param link link to parse
     *
     * @throws {ZaloApiError}
     *
     */
    return async function parseLink(link) {
        const params = {
            link,
            version: 1, // version 0 is not available errorMaps || version 1 is errorMaps (for response)
            imei: ctx.imei,
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt params");
        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });
        return utils.resolve(response);
    };
});

exports.parseLinkFactory = parseLinkFactory;
