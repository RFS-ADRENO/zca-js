import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type Settings = {
    show_online_status: boolean;
};

export type LastOnlineResponse = {
    settings: Settings;
    lastOnline: number;
};

export const lastOnlineFactory = apiFactory<LastOnlineResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/profile/lastOnline`);

    /**
     * Get last online
     *
     * @param uid User ID
     *
     * @throws ZaloApiError
     */
    return async function lastOnline(uid: string) {
        const params = {
            uid: uid,
            conv_type: 1,
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
