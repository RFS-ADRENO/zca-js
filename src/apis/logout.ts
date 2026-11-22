import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type LogoutResponse = {
    status: boolean;
};

export const logoutFactory = apiFactory<LogoutResponse>()((api, _ctx, utils) => {
    const logoutTokenURL = "https://id.zalo.me/jr/logout-token";
    const logoutURL = "https://id.zalo.me/account/logout";

    /**
     * Logout the current account, invalidating the session cookies and stopping the listener
     *
     * @throws {ZaloApiError}
     */
    return async function logout() {
        const tokenResponse = await utils.request(logoutTokenURL, {
            method: "POST",
            body: new URLSearchParams({
                continue: "https://chat.zalo.me/",
            }),
        });
        if (!tokenResponse.ok) throw new ZaloApiError("Failed to get logout token: " + tokenResponse.statusText);

        const tokenData = await tokenResponse.json();
        const token = tokenData?.data?.token;
        if (tokenData?.error_code !== 0 || !token)
            throw new ZaloApiError(tokenData?.error_message ?? "Failed to get logout token", tokenData?.error_code);

        const logoutResponse = await utils.request(logoutURL, {
            method: "POST",
            body: new URLSearchParams({
                token,
            }),
        });
        if (!logoutResponse.ok) throw new ZaloApiError("Failed to logout: " + logoutResponse.statusText);

        // The response is an HTML page that loads each `setsid` URL in an iframe to expire the session cookies on its domain
        const html = await logoutResponse.text();
        const setSidMatch = html.match(/listSetSidUrls\s*:\s*(\[[^\]]*\])/);
        if (!setSidMatch) throw new ZaloApiError("Failed to logout: setsid urls not found");

        const setSidURLs = JSON.parse(setSidMatch[1]) as string[];
        await Promise.all(
            setSidURLs.map((url) =>
                utils.request(url, {
                    method: "GET",
                    headers: {
                        Referer: "https://id.zalo.me/",
                    },
                }),
            ),
        );

        api.listener.stop();

        return {
            status: true,
        };
    };
});
