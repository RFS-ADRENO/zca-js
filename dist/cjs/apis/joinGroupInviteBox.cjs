'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const joinGroupInviteBoxFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/inv-box/join`);
    /**
     * Join group invite box
     *
     * @param groupId - The group id
     *
     * @throws {ZaloApiError}
     */
    return async function joinGroupInviteBox(groupId) {
        const params = {
            grid: groupId,
            lang: ctx.language,
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

exports.joinGroupInviteBoxFactory = joinGroupInviteBoxFactory;
