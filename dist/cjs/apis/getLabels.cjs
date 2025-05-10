'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const getLabelsFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.label[0]}/api/convlabel/get`);
    /**
     * Get all labels
     *
     * @throws ZaloApiError
     */
    return async function getLabels() {
        const params = {
            imei: ctx.imei,
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt message");
        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }));
        const unFormatted = (await utils.resolve(response));
        return {
            labelData: JSON.parse(unFormatted.labelData),
            version: unFormatted.version,
            lastUpdateTime: unFormatted.lastUpdateTime,
        };
    };
});

exports.getLabelsFactory = getLabelsFactory;
