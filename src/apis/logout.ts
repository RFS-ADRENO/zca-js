import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type LogoutResponse = {
    data?: unknown;
    error?: string;
    error_code?: number;
};

export const logoutFactory = apiFactory<LogoutResponse>()((api, ctx, utils) => {
    /**
     * Logout from Zalo account
     *
     * Implements the logoutV2 logic from Zalo Web client.
     * This API has no parameters and uses a fixed endpoint.
     *
     * @throws {ZaloApiError}
     */
    return async function logout() {
        // Logout endpoint following Zalo Web client implementation
        const serviceURL = utils.makeURL("https://wpa.chat.zalo.me/api/v2/login/logOut");

        // Prepare logout parameters as per Zalo Web client
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
