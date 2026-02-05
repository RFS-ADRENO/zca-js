import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils/index.js";

export enum UpdateLangAvailableLanguages {
    VI = "VI",
    EN = "EN",
}

export type UpdateLangResponse = "";

export const updateLangFactory = apiFactory<UpdateLangResponse>()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/profile/updatelang`);

    /**
     * Update language?
     *
     * @param language language to update (VI, EN)
     *
     * @note Calling this API alone will not update the user's language.
     * @throws {ZaloApiError}
     */
    return async function updateLang(language: UpdateLangAvailableLanguages = UpdateLangAvailableLanguages.VI) {
        const params = {
            language: language,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
