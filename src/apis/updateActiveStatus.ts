import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type UpdateActiveStatusResponse = {
    status: boolean;
};

export const updateActiveStatusFactory = apiFactory<UpdateActiveStatusResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/profile/ping`);

    /**
     * Update active status?
     *
     * @throws {ZaloApiError}
     */
    return async function updateActiveStatus() {
        const params = {
            status: 1,
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
