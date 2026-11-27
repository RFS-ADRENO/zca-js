import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type RecentSearchItem = {
    displayName: string;
    avatar: string;
    type: number;
    userId: string;
    last_update_time: number;
};

export type GetRecentSearchListResponse = {
    version: number;
    list_recent: RecentSearchItem[];
    list_keyword: string[];
};

export const getRecentSearchListFactory = apiFactory<GetRecentSearchListResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.recent_search[0]}/api/recentsearch/list`);

    /**
     * Get recent search list
     *
     * @param version The search history version
     *
     * @throws {ZaloApiError}
     */
    return async function getRecentSearchList(version: number = 0) {
        const params = {
            version: version,
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
