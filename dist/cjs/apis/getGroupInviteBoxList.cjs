'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const getGroupInviteBoxListFactory = utils.apiFactory()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/inv-box/list`);
    /**
     * Get group invite box list
     *
     * @param payload - The payload of the request
     *
     * @throws {ZaloApiError}
     */
    return async function getGroupInviteBoxList(payload) {
        var _a, _b, _c, _d;
        const params = {
            mpage: (_a = payload === null || payload === void 0 ? void 0 : payload.mpage) !== null && _a !== void 0 ? _a : 1,
            page: (_b = payload === null || payload === void 0 ? void 0 : payload.page) !== null && _b !== void 0 ? _b : 0,
            invPerPage: (_c = payload === null || payload === void 0 ? void 0 : payload.invPerPage) !== null && _c !== void 0 ? _c : 12,
            mcount: (_d = payload === null || payload === void 0 ? void 0 : payload.mcount) !== null && _d !== void 0 ? _d : 10,
            lastGroupId: null, // @TODO: check type
            avatar_size: 120,
            member_avatar_size: 120,
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

exports.getGroupInviteBoxListFactory = getGroupInviteBoxListFactory;
