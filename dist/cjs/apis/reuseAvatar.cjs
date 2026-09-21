'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const reuseAvatarFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/reuse-avatar`);
    /**
     * Reuse avatar
     *
     * @param photoId photo id from getAvatarList api
     *
     * @throws {ZaloApiError}
     */
    return async function reuseAvatar(photoId) {
        const params = {
            photoId: photoId,
            isPostSocial: 0,
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

exports.reuseAvatarFactory = reuseAvatarFactory;
