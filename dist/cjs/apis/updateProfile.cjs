'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const updateProfileFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/profile/update`);
    /**
     * Change account setting information
     *
     * @param payload payload
     *
     * @note If your account is a Business Account, include the biz.cate field; otherwise the category will be removed.
     * You may leave the other biz fields empty if you don’t want to change them.
     *
     * @throws {ZaloApiError}
     */
    return async function updateProfile(payload) {
        var _a, _b, _c, _d, _e;
        const params = {
            profile: JSON.stringify({
                name: payload.profile.name,
                dob: payload.profile.dob,
                gender: payload.profile.gender,
            }),
            biz: JSON.stringify({
                desc: (_a = payload.biz) === null || _a === void 0 ? void 0 : _a.description,
                cate: (_b = payload.biz) === null || _b === void 0 ? void 0 : _b.cate,
                addr: (_c = payload.biz) === null || _c === void 0 ? void 0 : _c.address,
                website: (_d = payload.biz) === null || _d === void 0 ? void 0 : _d.website,
                email: (_e = payload.biz) === null || _e === void 0 ? void 0 : _e.email,
            }),
            language: ctx.language,
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

exports.updateProfileFactory = updateProfileFactory;
