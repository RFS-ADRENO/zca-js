'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const getUnreadMarkFactory = utils.apiFactory()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/conv/getUnreadMark`);
    /**
     * Get unread mark
     *
     * @throws {ZaloApiError}
     *
     */
    return async function getUnreadMark() {
        const params = {};
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt params");
        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });
        return utils.resolve(response, (result) => {
            const data = result.data;
            if (typeof data.data === "string") {
                return {
                    data: JSON.parse(data.data),
                    status: data.status,
                };
            }
            return data;
        });
    };
});

exports.getUnreadMarkFactory = getUnreadMarkFactory;
