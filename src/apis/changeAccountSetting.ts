import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory, encodeAES, makeURL, request } from "../utils.js";

export type ChangeAccountSettingResponse = "";

export const changeAccountSettingFactory = apiFactory<ChangeAccountSettingResponse>()((api, ctx, resolveresolve) => {
    const serviceURL = makeURL(`${api.zpwServiceMap.profile[0]}/api/social/profile/update`);

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
    return async function changeAccountSetting(name: string, dob: string, gender: number, language: string = "vi") {
        const params = {
            profile: JSON.stringify({
                name: name,
                dob: dob,
                gender: gender,
            }),
            biz: JSON.stringify({}),
            language: language,
        };

        const encryptedParams = encodeAES(ctx.secretKey, JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return resolve(response);
    };
});
