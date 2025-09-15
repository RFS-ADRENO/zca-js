import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type UpdateDeactiveStatusResponse = {
    status: boolean;
};

export const updateDeactiveStatusFactory = apiFactory<UpdateDeactiveStatusResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/profile/deactive`);

    /**
     * Update deactive status?
     *
     * @throws {ZaloApiError}
     */
    return async function updateDeactiveStatus() {
        const params = {
            status: 0,
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
