'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

exports.UpdateLangAvailableLanguages = void 0;
(function (UpdateLangAvailableLanguages) {
    UpdateLangAvailableLanguages["VI"] = "VI";
    UpdateLangAvailableLanguages["EN"] = "EN";
})(exports.UpdateLangAvailableLanguages || (exports.UpdateLangAvailableLanguages = {}));
const updateLangFactory = utils.apiFactory()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/profile/updatelang`);
    /**
     * Update language?
     *
     * @param language language to update (VI, EN)
     *
     * @note Calling this API alone will not update the user's language.
     * @throws {ZaloApiError}
     */
    return async function updateLang(language = exports.UpdateLangAvailableLanguages.VI) {
        const params = {
            language: language,
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

exports.updateLangFactory = updateLangFactory;
