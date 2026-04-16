import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetListDeviceResponse = {
    devices: {
        masterId: string;
        encIdentity: string;
        lastUpdateTs: number;
        encSignature: string;
        companions: string[] | unknown[]; // @TODO check type later
    };
};

export const getListDeviceFactory = apiFactory<GetListDeviceResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.aext[0]}/api/devices/linked`);

    /**
     * Get list device
     *
     * @throws {ZaloApiError}
     */
    return async function getListDevice() {
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
