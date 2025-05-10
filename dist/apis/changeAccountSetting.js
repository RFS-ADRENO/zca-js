import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";
export const changeAccountSettingFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/profile/update`);
    /**
     * Change account setting information
     *
     * @param name The new account name
     * @param dob Date of birth wants to change (format: year-month-day)
     * @param gender Gender wants to change (0 = Male, 1 = Female)
     * @param language Zalo language wants to change (default is vi = Vietnamese) || (en = English, my = Malaysia)
     *
     * @throws ZaloApiError
     */
    return async function changeAccountSetting(name, dob, gender, language = "vi") {
        const params = {
            profile: JSON.stringify({
                name: name,
                dob: dob,
                gender: gender,
            }),
            biz: JSON.stringify({}),
            language: language,
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError("Failed to encrypt params");
        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils.resolve(response);
    };
});
