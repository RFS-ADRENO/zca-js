import { apiFactory } from "../utils.js";

import type { User } from "../models/index.js";

export type FetchAccountInfoResponse = User;

export const fetchAccountInfoFactory = apiFactory<FetchAccountInfoResponse>()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/profile/me-v2`);

    return async function fetchAccountInfo() {
        const response = await utils.request(serviceURL, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
