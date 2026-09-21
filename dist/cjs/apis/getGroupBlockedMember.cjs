'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const getGroupBlockedMemberFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/blockedmems/list`);
    /**
     * Get group blocked member
     *
     * @param payload payload
     * @param groupId group id
     *
     * @throws {ZaloApiError}
     */
    return async function getGroupBlockedMember(payload, groupId) {
        var _a, _b;
        const params = {
            grid: groupId,
            page: (_a = payload.page) !== null && _a !== void 0 ? _a : 1,
            count: (_b = payload.count) !== null && _b !== void 0 ? _b : 50,
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

exports.getGroupBlockedMemberFactory = getGroupBlockedMemberFactory;
