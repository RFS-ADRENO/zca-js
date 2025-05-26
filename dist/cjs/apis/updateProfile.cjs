'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const updateProfileFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/profile/update`);
    /**
     * Change account setting information
     *
     * @param name Profile name wants to change
     * @param dob Date of birth wants to change (format: year-month-day)
     * @param gender Gender wants to change (0 = Male, 1 = Female)
     *
     * @throws ZaloApiError
     */
    return async function updateProfile(name, dob, gender) {
        const params = {
            profile: JSON.stringify({
                name: name,
                dob: dob,
                gender: gender,
            }),
            biz: JSON.stringify({}),
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
