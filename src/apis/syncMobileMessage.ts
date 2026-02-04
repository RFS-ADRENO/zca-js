import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type SyncMobileMessageResponse = {
    /** API long IDs for groups (corresponding to input gids) */
    gids?: string[];
    /** API long IDs for users (corresponding to input fids) */
    fids?: string[];
    /** Mapping from mobile group IDs to API long IDs */
    groupMappings?: Record<string, string>;
    /** Mapping from mobile user IDs to API long IDs */
    userMappings?: Record<string, string>;
    [key: string]: unknown;
};

export type SyncMobileMessageParams = {
    /** Mobile user IDs to get mappings for */
    fids?: string[];
    /** Mobile group IDs to get mappings for */
    gids?: string[];
};

export const syncMobileMessageFactory = apiFactory<SyncMobileMessageResponse>()((api, ctx, utils) => {
    /**
     * Get ID mappings from mobile IDs to API long IDs
     *
     * This API converts mobile short IDs to the standard API long format IDs.
     * Send arrays of mobile IDs and receive corresponding API IDs in the same order.
     *
     * @param params - Object containing mobile IDs to convert
     * @param params.fids - Array of mobile user IDs (as strings)
     * @param params.gids - Array of mobile group IDs (as strings)
     *
     * @returns Object containing:
     *   - fids: Array of API long user IDs (same order as input)
     *   - gids: Array of API long group IDs (same order as input)
     *   - userMappings: Record mapping mobile user ID -> API user ID
     *   - groupMappings: Record mapping mobile group ID -> API group ID
     *
     * @note Must call pullMobileMessage() first and complete sync on mobile
     *
     * @throws {ZaloApiError}
     */
    return async function syncMobileMessage(params: SyncMobileMessageParams = {}) {
        const baseURL = "https://zwid.api.zalo.me/api/znoise";

        // Convert string IDs to numbers for the API
        const requestParams = {
            fids: (params.fids ?? []).map(id => parseInt(id, 10)).filter(id => !isNaN(id)),
            gids: (params.gids ?? []).map(id => parseInt(id, 10)).filter(id => !isNaN(id)),
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(requestParams));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const url = utils.makeURL(baseURL);

        // Get zpw_sek cookie from chat.zalo.me domain (where it's stored)
        const chatCookies = await ctx.cookie.getCookieString("https://chat.zalo.me");
        const zpwSekMatch = chatCookies.match(/zpw_sek=([^;]+)/);
        const zpwSek = zpwSekMatch ? zpwSekMatch[0] : "";

        const response = await utils.request(url, {
            method: "POST",
            body: new URLSearchParams({ params: encryptedParams }),
            headers: {
                Cookie: zpwSek, // Use zpw_sek from chat.zalo.me
            },
        });

        const result = await utils.resolve(response);

        // Build mapping objects from the response arrays
        const userMappings: Record<string, string> = {};
        const groupMappings: Record<string, string> = {};

        // Map fids: input mobile ID -> output API ID (same index)
        if (Array.isArray(result.fids) && params.fids) {
            for (let i = 0; i < params.fids.length && i < result.fids.length; i++) {
                const mobileId = params.fids[i];
                const apiId = result.fids[i];
                if (mobileId && apiId) {
                    userMappings[mobileId] = apiId;
                }
            }
        }

        // Map gids: input mobile ID -> output API ID (same index)
        if (Array.isArray(result.gids) && params.gids) {
            for (let i = 0; i < params.gids.length && i < result.gids.length; i++) {
                const mobileId = params.gids[i];
                const apiId = result.gids[i];
                if (mobileId && apiId) {
                    groupMappings[mobileId] = apiId;
                }
            }
        }

        return {
            ...result,
            userMappings,
            groupMappings,
        };
    };
});
