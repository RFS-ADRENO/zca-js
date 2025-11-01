import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type LogoutResponse = {
    data?: unknown;
    error?: string;
    error_code?: number;
};

export type LogoutOptions = {
    url?: string;
    params?: Record<string, unknown>;
};

export const logoutFactory = apiFactory<LogoutResponse>()((api, ctx, utils) => {
    /**
     * Logout from Zalo account
     *
     * This is a base logout API that posts to a logout URL.
     * The specific URL and request body will be configured later.
     *
     * @param options - Logout options
     * @param options.url - The logout endpoint URL (optional, defaults to placeholder)
     * @param options.params - Additional parameters for the logout request (optional)
     *
     * @throws {ZaloApiError}
     */
    return async function logout(options: LogoutOptions = {}) {
        // Default logout URL placeholder - to be updated with actual Zalo logout endpoint
        const defaultLogoutUrl = "https://wpa.chat.zalo.me/api/logout";
        const serviceURL = utils.makeURL(options.url || defaultLogoutUrl);

        // Prepare logout parameters
        const params = {
            imei: ctx.imei,
            language: ctx.language,
            ...(options.params || {}),
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
