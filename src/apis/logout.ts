import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type LogoutResponse = unknown;

export const logoutFactory = apiFactory<LogoutResponse>()((api, ctx, utils) => {
    /**
     * Logout from Zalo account
     *
     * @throws {ZaloApiError}
     */
    return async function logout() {
        const serviceURL = utils.makeURL("https://wpa.chat.zalo.me/api/v2/login/logOut");

        const params = {
            time: Date.now(),
            imei: ctx.imei,
            computer_name: "Web",
            language: ctx.language,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
