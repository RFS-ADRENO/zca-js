import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type UpdateLangResponse = "";

export const updateLangFactory = apiFactory<UpdateLangResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/profile/updatelang`);

    /**
     * Update language
     *
     * @param language language to update (VI, EN)
     *
     * @throws ZaloApiError
     *
     */
    return async function updateLang(language: string = "VI") {
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
