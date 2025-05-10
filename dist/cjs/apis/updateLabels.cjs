'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const updateLabelsFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.label[0]}/api/convlabel/update`);
    /**
     * Update labels
     *
     * @param label label data
     *
     * @throws ZaloApiError
     */
    return async function updateLabels(label) {
        const params = {
            labelData: JSON.stringify(label.labelData),
            version: label.version,
            imei: ctx.imei,
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt message");
        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        const unFormatted = (await utils.resolve(response));
        return {
            labelData: JSON.parse(unFormatted.labelData),
            version: unFormatted.version,
            lastUpdateTime: unFormatted.lastUpdateTime,
        };
    };
});

exports.updateLabelsFactory = updateLabelsFactory;
