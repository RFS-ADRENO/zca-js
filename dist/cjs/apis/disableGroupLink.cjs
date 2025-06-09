'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const disableGroupLinkFactory = utils.apiFactory()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/link/disable`);
    /**
     * Disable group link
     *
     * @param groupId The group id
     *
     * @throws ZaloApiError
     */
    return async function disableGroupLink(groupId) {
        const params = {
            grid: groupId,
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

exports.disableGroupLinkFactory = disableGroupLinkFactory;
