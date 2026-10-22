import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type PreloadConversationsResponse = {
    conversations?: Array<{
        conv_id: string;
        last_msgs?: unknown[];
        unread_count?: number;
        [key: string]: unknown;
    }>;
    [key: string]: unknown;
};

export const preloadConversationsFactory = apiFactory<PreloadConversationsResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/preloadconvers/get-last-msgs`);

    /**
     * Preload last messages across all active conversations.
     * Useful for initial state loading and catching up missed messages after reconnect.
     *
     * @throws {ZaloApiError}
     */
    return async function preloadConversations() {
        const params = {
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
